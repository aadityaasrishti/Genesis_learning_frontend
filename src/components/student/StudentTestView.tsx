import React, {
  useState,
  useEffect,
  ChangeEvent,
  useCallback,
  useRef,
} from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
  Alert,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  DialogContentText,
} from "@mui/material";
import api from "../../services/api";
import { Test } from "../../types/test";
import { useAuth } from "../../context/AuthContext";
import "../../styles/TestManagement.css";
import AccessibleDialog from "../Common/AccessibleDialog";

const ALLOWED_FILE_TYPES = [".pdf", ".doc", ".docx"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const GRACE_PERIOD_MINUTES = 10;

const Timer: React.FC<{
  initialTime: number;
  onTimeEnd: () => void;
  onTimeUpdate: (newTime: number) => void;
  isLate: boolean;
}> = React.memo(({ initialTime, onTimeEnd, onTimeUpdate, isLate }) => {
  const [internalTimeLeft, setInternalTimeLeft] = useState(initialTime);

  useEffect(() => {
    setInternalTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    const timer = setInterval(() => {
      setInternalTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          onTimeEnd();
          return 0;
        }
        onTimeUpdate(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeEnd, onTimeUpdate]);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  return (
    <Typography
      variant="h6"
      component="div"
      color={
        isLate ? "error" : internalTimeLeft < 300 ? "warning.main" : "primary"
      }
      sx={{ mt: 1 }}
      role="timer"
      aria-live="polite"
    >
      {isLate ? "OVERTIME - " : ""}
      Time Remaining: {formatTime(internalTimeLeft)}
    </Typography>
  );
});

interface TestContentViewerProps {
  testId: number;
  onError: (error: any) => void;
  type: string;
  content?: string;
}

const TestContentViewer = React.memo(
  ({ testId, onError, type, content }: TestContentViewerProps) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const loadedRef = useRef(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }
      };
    }, []);

    useEffect(() => {
      const loadContent = async () => {
        if (type !== "PDF" || loadedRef.current) {
          setIsLoading(false);
          return;
        }

        try {
          setIsLoading(true);
          const response = await api.tests.getTestContent(testId);
          if (isMountedRef.current) {
            const url = URL.createObjectURL(response.data);
            setPdfUrl(url);
            loadedRef.current = true;
          }
        } catch (error) {
          if (isMountedRef.current) {
            onError(error);
          }
        } finally {
          if (isMountedRef.current) {
            setIsLoading(false);
          }
        }
      };

      loadContent();
    }, [testId, type]);

    if (isLoading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="400px"
        >
          <CircularProgress />
        </Box>
      );
    }

    if (type === "PDF") {
      if (!pdfUrl) return null;

      return (
        <Box sx={{ width: "100%", height: "calc(100vh - 200px)" }}>
          <object
            data={pdfUrl}
            type="application/pdf"
            className="submission-viewer"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          >
            <embed
              src={pdfUrl}
              type="application/pdf"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          </object>
        </Box>
      );
    }

    return (
      <Paper elevation={1} sx={{ p: 3, height: "100%" }}>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {content}
        </Typography>
      </Paper>
    );
  }
);

TestContentViewer.displayName = "TestContentViewer";

const StudentTestView: React.FC = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState<{
    upcoming: Test[];
    ongoing: Test[];
    expired: Test[];
    submitted: Test[];
  }>({
    upcoming: [],
    ongoing: [],
    expired: [],
    submitted: [],
  });
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLate, setIsLate] = useState(false);
  const [hasExitedFullscreen, setHasExitedFullscreen] = useState(false);
  const [testCompromised, setTestCompromised] = useState<{
    [key: number]: boolean;
  }>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user?.user_id) {
      setError("Please log in to view tests");
      return;
    }
    fetchTests();
    // Load compromised test states from localStorage
    const compromisedTests = localStorage.getItem("compromisedTests");
    if (compromisedTests) {
      setTestCompromised(JSON.parse(compromisedTests));
    }
  }, [user?.user_id]);

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.tests.getAvailable();
      if (!response.data) {
        throw new Error("No data received from server");
      }

      setTests(response.data);
      console.log("Tests loaded:", response.data);
    } catch (error: any) {
      console.error("Error fetching tests:", error);
      setError(error.response?.data?.error || "Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const enterFullscreen = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      console.error("Error entering fullscreen:", error);
      setError("Failed to enter fullscreen mode. Please try again.");
    }
  };

  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = !!document.fullscreenElement;
    if (!isCurrentlyFullscreen && showTestDialog && selectedTest) {
      setHasExitedFullscreen(true);
      setError("Test session compromised - Exited fullscreen mode");

      // Store the compromised state in localStorage
      const updatedCompromised = {
        ...testCompromised,
        [selectedTest.id]: true,
      };
      setTestCompromised(updatedCompromised);
      localStorage.setItem(
        "compromisedTests",
        JSON.stringify(updatedCompromised)
      );
    }
    setIsFullscreen(isCurrentlyFullscreen);
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, [showTestDialog]);

  const calculateTimeLeft = useCallback((test: Test) => {
    const startTime = new Date(test.startTime);
    const now = new Date();
    const endTime = new Date(
      startTime.getTime() + (test.duration + GRACE_PERIOD_MINUTES) * 60 * 1000
    );
    const timeLeft = Math.max(
      0,
      Math.floor((endTime.getTime() - now.getTime()) / 1000)
    );
    const isLate =
      now > new Date(startTime.getTime() + test.duration * 60 * 1000);
    return { timeLeft, isLate };
  }, []);

  const handleTakeTest = async (test: Test) => {
    if (testCompromised[test.id]) {
      setError(
        "This test has been compromised. You cannot view the test paper, but you may still submit your answer file."
      );
      return;
    }

    const { timeLeft, isLate } = calculateTimeLeft(test);

    if (timeLeft === 0) {
      setError("This test has expired and can no longer be taken.");
      return;
    }

    setSelectedTest(test);
    setSubmitSuccess(false);
    setError(null);
    setTimeLeft(timeLeft);
    setIsLate(isLate);
    setHasExitedFullscreen(false);
    setSubmissionFile(null);

    try {
      await enterFullscreen();
      setShowTestDialog(true);
    } catch (error) {
      setError(
        "Failed to start test. Please ensure fullscreen mode is supported."
      );
    }
  };

  const handleCloseTest = async () => {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
    }
    setShowTestDialog(false);
    setSelectedTest(null);
    setSubmissionFile(null);
    setError(null);
    setTimeLeft(null);
    setHasExitedFullscreen(false);
    // Focus will be restored by AccessibleDialog
  };

  const validateFile = (file: File): string | null => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(extension)) {
      return `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(
        ", "
      )}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size exceeds 50MB limit";
    }
    return null;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError("No file selected");
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSubmissionFile(null);
      return;
    }

    setSubmissionFile(file);
    setError(null);
  };

  const handleTimeEnd = useCallback(() => {
    handleSubmit(true);
  }, []);

  const handleTimeUpdate = useCallback((newTime: number) => {
    setTimeLeft(newTime);
  }, []);

  const handleSubmit = async (
    e?: React.MouseEvent<Element, MouseEvent> | boolean
  ) => {
    if (typeof e !== "boolean" && e) {
      e.preventDefault();
    }

    if (!selectedTest) {
      setError("No test selected");
      return;
    }

    if (!submissionFile) {
      setError("Please select a file to submit");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { isLate } = calculateTimeLeft(selectedTest);
      const formData = new FormData();
      formData.append("file", submissionFile);
      formData.append("testId", selectedTest.id.toString());
      formData.append("isLate", String(isLate));

      console.log("Submitting test with file:", submissionFile.name, {
        isLate,
        timeLeft,
      });

      const response = await api.tests.submit(formData);

      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      if (response.data.isLate) {
        setError(
          "Test submitted after the allowed duration - marked as late submission"
        );
        setSubmitSuccess(true);
      } else {
        setSubmitSuccess(true);
      }

      await fetchTests();
      handleCloseTest();
    } catch (error: any) {
      console.error("Error submitting test:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to submit test. Please try again or contact support."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDialog = async (test: Test) => {
    await handleTakeTest(test);
    // Focus will be handled by AccessibleDialog
  };

  // Handle keyboard events for test navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isFullscreen) return;

      switch (event.key) {
        case "Escape":
          handleCloseTest();
          break;
        case "ArrowLeft":
          if (currentPage > 1) setCurrentPage((prev) => prev - 1);
          break;
        case "ArrowRight":
          if (currentPage < 1) setCurrentPage((prev) => prev + 1);
          break;
        default:
          break;
      }
    },
    [isFullscreen, currentPage]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleTestContentError = useCallback((error: any) => {
    console.error("Error loading test content:", error);
    setError("Failed to load test content. Please try again.");
  }, []);

  const renderTestList = (
    testList: Test[],
    sectionTitle: string,
    showTimer: boolean = false,
    variant: "info" | "warning" | "error" = "info"
  ) =>
    testList.length > 0 && (
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ color: (theme) => theme.palette[variant].main }}
          gutterBottom
        >
          {sectionTitle}
          {variant === "warning" &&
            testList.some((test) => test.isInGracePeriod) && (
              <Typography
                component="span"
                color="error"
                sx={{ ml: 2, fontSize: "0.8em" }}
              >
                (Grace Period Active)
              </Typography>
            )}
        </Typography>
        <List>
          {testList.map((test) => (
            <Paper
              key={test.id}
              className="test-list-item"
              sx={{ mb: 2, opacity: testCompromised[test.id] ? 0.7 : 1 }}
            >
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="h6" component="div">
                      {test.title}
                      {testCompromised[test.id] && (
                        <Typography
                          component="span"
                          color="error"
                          sx={{ ml: 1, fontSize: "0.8em" }}
                        >
                          (Test paper access revoked)
                        </Typography>
                      )}
                    </Typography>
                  }
                  secondaryTypographyProps={{ component: "div" }}
                  secondary={
                    <>
                      <Typography variant="body2">
                        {test.description}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Start Time: {new Date(test.startTime).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        Duration: {test.duration} minutes
                      </Typography>
                      {showTimer && typeof test.timeLeft === "number" && (
                        <Typography
                          variant="body2"
                          sx={{ color: (theme) => theme.palette[variant].main }}
                        >
                          Time Left: {Math.floor(test.timeLeft / (1000 * 60))}{" "}
                          minutes
                        </Typography>
                      )}
                      {test.isInGracePeriod &&
                        typeof test.lateTimeLeft === "number" && (
                          <Typography variant="body2" color="error">
                            Grace Period:{" "}
                            {Math.floor(test.lateTimeLeft / (1000 * 60))}{" "}
                            minutes remaining
                          </Typography>
                        )}
                      {test.submission && (
                        <Box
                          sx={{
                            mt: 1,
                            borderLeft: "3px solid",
                            borderColor: "primary.main",
                            pl: 2,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Submitted:{" "}
                            {new Date(
                              test.submission.submitted_at
                            ).toLocaleString()}
                            {test.submission.is_late && (
                              <Typography
                                component="span"
                                color="error"
                                sx={{ ml: 1 }}
                              >
                                (Late Submission)
                              </Typography>
                            )}
                          </Typography>
                          {test.submission.grade !== null && (
                            <Typography
                              variant="body1"
                              color="primary"
                              sx={{ mt: 0.5 }}
                            >
                              Grade: {test.submission.grade}/100
                            </Typography>
                          )}
                          {test.submission.feedback && (
                            <Typography
                              variant="body2"
                              sx={{ mt: 0.5, color: "text.secondary" }}
                            >
                              Feedback: {test.submission.feedback}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </>
                  }
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    minWidth: "200px",
                  }}
                >
                  {!test.hasSubmitted && (
                    <>
                      {!testCompromised[test.id] && (
                        <Button
                          onClick={() => handleOpenDialog(test)}
                          variant="contained"
                          color={variant || "primary"}
                          fullWidth
                        >
                          View Test Paper
                        </Button>
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <input
                          type="file"
                          onChange={(e) => {
                            setSelectedTest(test);
                            handleFileChange(e);
                          }}
                          style={{ display: "none" }}
                          id={`submission-input-${test.id}`}
                          accept={ALLOWED_FILE_TYPES.join(",")}
                        />
                        <label htmlFor={`submission-input-${test.id}`}>
                          <Button
                            component="span"
                            variant="outlined"
                            color={variant || "secondary"}
                            fullWidth
                            disabled={submitting}
                          >
                            Choose Answer File
                          </Button>
                        </label>
                        {selectedTest?.id === test.id && submissionFile && (
                          <Typography
                            variant="caption"
                            sx={{ wordBreak: "break-word" }}
                          >
                            Selected: {submissionFile.name}
                          </Typography>
                        )}
                        <Button
                          onClick={() => handleSubmit()}
                          variant="contained"
                          color={variant || "secondary"}
                          disabled={
                            submitting ||
                            !submissionFile ||
                            selectedTest?.id !== test.id
                          }
                          fullWidth
                        >
                          {submitting ? "Submitting..." : "Submit Answer"}
                        </Button>
                      </Box>
                    </>
                  )}
                  {test.hasSubmitted && test.submission?.id && (
                    <Button
                      onClick={() => {
                        const submissionId = test.submission?.id;
                        if (submissionId) {
                          window.open(
                            `/api/tests/submissions/${submissionId}/content`,
                            "_blank"
                          );
                        }
                      }}
                      variant="outlined"
                      color="primary"
                      fullWidth
                    >
                      View Submission
                    </Button>
                  )}
                </Box>
              </ListItem>
            </Paper>
          ))}
        </List>
      </Box>
    );

  return (
    <Box className="test-management-container">
      <Typography variant="h4" gutterBottom>
        Tests
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {submitSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSubmitSuccess(false)}
        >
          Test submitted successfully!
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {renderTestList(tests.ongoing, "Ongoing Tests", true, "warning")}
          {renderTestList(tests.upcoming, "Upcoming Tests", false, "info")}
          {renderTestList(tests.submitted, "Submitted Tests")}
          {renderTestList(tests.expired, "Expired Tests", false, "error")}

          {Object.values(tests).every((section) => section.length === 0) && (
            <Typography variant="body1" color="text.secondary" align="center">
              No tests available at the moment
            </Typography>
          )}
        </>
      )}

      {/* Test Taking Dialog */}
      <AccessibleDialog
        open={showTestDialog}
        onClose={handleCloseTest}
        maxWidth={false}
        fullScreen
        className="submission-dialog"
        disableEscapeKeyDown
        aria-labelledby="test-dialog-title"
        aria-describedby="test-dialog-desc"
        keepMounted={false} // Don't keep the dialog mounted when closed
        sx={{
          "& .MuiDialog-paper": {
            margin: 0,
            width: "100%",
            maxWidth: "100%",
            height: "100%",
            maxHeight: "none",
          },
        }}
      >
        <Box
          role="dialog"
          aria-modal="true"
          sx={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <DialogTitle id="test-dialog-title">
            <Box
              component="div"
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h6" component="h2">
                  {selectedTest?.title}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                  id="test-dialog-desc"
                >
                  Duration: {selectedTest?.duration} minutes
                </Typography>
                {selectedTest && (
                  <Timer
                    initialTime={timeLeft || 0}
                    onTimeEnd={handleTimeEnd}
                    onTimeUpdate={handleTimeUpdate}
                    isLate={isLate}
                  />
                )}
              </Box>
              {hasExitedFullscreen && (
                <Typography
                  color="error"
                  variant="body1"
                  role="alert"
                  aria-live="assertive"
                >
                  Warning: Test session compromised - Exited fullscreen mode
                </Typography>
              )}
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedTest && (
              <Box sx={{ width: "100%", height: "calc(100vh - 200px)" }}>
                <TestContentViewer
                  testId={selectedTest.id}
                  type={selectedTest.type}
                  content={selectedTest.content}
                  onError={handleTestContentError}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseTest}
              variant="outlined"
              color="error"
              aria-label="Close test and exit fullscreen"
            >
              Close Test
            </Button>
          </DialogActions>
        </Box>
      </AccessibleDialog>

      {/* Confirmation Dialog */}
      <AccessibleDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        aria-labelledby="confirm-dialog-title"
        role="alertdialog"
      >
        <DialogTitle id="confirm-dialog-title">Submit Test</DialogTitle>
        <DialogContent>
          <DialogContentText role="alert">
            Are you sure you want to submit your test? You cannot make changes
            after submission.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowConfirmDialog(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </Button>
        </DialogActions>
      </AccessibleDialog>

      {/* Exit Fullscreen Warning */}
      <AccessibleDialog
        open={showExitWarning}
        onClose={() => setShowExitWarning(false)}
        aria-labelledby="exit-warning-title"
        role="alertdialog"
      >
        <DialogTitle id="exit-warning-title">Warning</DialogTitle>
        <DialogContent>
          <DialogContentText role="alert">
            Exiting fullscreen mode during the test is not allowed. Please
            complete your test in fullscreen mode.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowExitWarning(false);
              enterFullscreen();
            }}
            variant="contained"
            color="primary"
          >
            Return to Fullscreen
          </Button>
        </DialogActions>
      </AccessibleDialog>

      {/* Timer Warning Dialog */}
      <AccessibleDialog
        open={showTimerWarning}
        onClose={() => setShowTimerWarning(false)}
        aria-labelledby="timer-warning-title"
        role="alertdialog"
      >
        <DialogTitle id="timer-warning-title">Time Warning</DialogTitle>
        <DialogContent>
          <DialogContentText role="alert">
            You have less than 5 minutes remaining. Please finish your test and
            submit.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowTimerWarning(false)}
            variant="contained"
            color="primary"
          >
            Understood
          </Button>
        </DialogActions>
      </AccessibleDialog>

      {isFullscreen && (
        <div
          className="fullscreen-controls"
          role="toolbar"
          aria-label="Test navigation"
        >
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            Previous
          </Button>
          <Typography>Page {currentPage} of 1</Typography>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(1, prev + 1))}
            disabled={currentPage === 1}
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
      )}
    </Box>
  );
};

export default StudentTestView;
