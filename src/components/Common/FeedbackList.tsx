import React, { useEffect, useState, useCallback, useRef } from "react";
import { Feedback } from "../../types/feedback";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Rating,
  Button,
  Pagination,
  Stack,
  Alert,
  styled,
} from "@mui/material";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4),
}));

interface DateRange {
  startDate: string;
  endDate: string;
}

interface FeedbackListProps {
  filterType?: "all" | "student" | "teacher";
  searchTerm?: string;
  dateRange?: DateRange;
  showControls?: boolean;
}

interface PaginationInfo {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

interface RequestQueue {
  promise: Promise<any>;
  cancel: () => void;
}

const DEBOUNCE_DELAY = 300;

const FeedbackList: React.FC<FeedbackListProps> = ({
  filterType = "all",
  searchTerm = "",
  dateRange,
  showControls = false,
}) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(
    null
  );
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestQueueRef = useRef<RequestQueue | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const cancelPendingRequest = () => {
    if (requestQueueRef.current) {
      requestQueueRef.current.cancel();
      requestQueueRef.current = null;
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  const createAbortController = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  };

  const fetchWithTimeout = async (url: string, options: any) => {
    const signal = createAbortController();
    const timeoutId = setTimeout(
      () => abortControllerRef.current?.abort(),
      options.timeout || 10000
    );

    try {
      const response = await api.get(url, {
        ...options,
        signal,
        priority: url.includes("/count") ? "high" : "normal",
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  const fetchFeedbacks = useCallback(
    async (retry = 0, isManualRetry = false) => {
      cancelPendingRequest();

      try {
        setLoading(true);
        setError(null);

        const params = {
          filterType: filterType !== "all" ? filterType : undefined,
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate,
        };

        const controller = new AbortController();
        const countPromise = fetchWithTimeout("/feedback/count", {
          params,
          signal: controller.signal,
          timeout: 5000,
        });

        requestQueueRef.current = {
          promise: countPromise,
          cancel: () => controller.abort(),
        };

        const countResponse = await countPromise;
        const total = countResponse.data.total;
        const totalPages = Math.ceil(total / 20);
        const currentPage = Math.min(page, totalPages || 1);

        if (total === 0) {
          setFeedbacks([]);
          setPaginationInfo({
            total: 0,
            pages: 0,
            currentPage: 1,
            limit: 20,
          });
          setLoading(false);
          return;
        }

        const dataPromise = fetchWithTimeout("/feedback", {
          params: {
            ...params,
            page: currentPage,
            limit: 20,
          },
          timeout: retry > 0 ? 15000 : 10000,
        });

        requestQueueRef.current = {
          promise: dataPromise,
          cancel: () => controller.abort(),
        };

        const response = await dataPromise;
        const { feedbacks: fetchedFeedbacks } = response.data;

        if (!controller.signal.aborted) {
          const filteredFeedbacks = searchTerm
            ? fetchedFeedbacks.filter((feedback: Feedback) => {
                const term = searchTerm.toLowerCase();
                return (
                  feedback.message.toLowerCase().includes(term) ||
                  feedback.from_user.name.toLowerCase().includes(term) ||
                  feedback.to_user.name.toLowerCase().includes(term)
                );
              })
            : fetchedFeedbacks;

          setFeedbacks(filteredFeedbacks);
          setPaginationInfo({
            total,
            pages: totalPages,
            currentPage,
            limit: 20,
          });
          setError(null);
          setRetryCount(0);
        }
      } catch (error: any) {
        if (error.name === "CanceledError" || error.name === "AbortError") {
          return;
        }

        console.error("Error fetching feedbacks:", error);
        const errorMessage = error.response?.data?.error || error.message;
        const isTimeout =
          error.code === "ECONNABORTED" || errorMessage.includes("timeout");

        if (isTimeout && retry < 2 && !isManualRetry) {
          setRetryCount(retry + 1);
          const delay = Math.min(1000 * Math.pow(2, retry), 4000);
          debounceTimerRef.current = setTimeout(() => {
            fetchFeedbacks(retry + 1, false);
          }, delay);
        } else {
          setError(
            isTimeout
              ? "Request timed out. Please try again."
              : "Failed to fetch feedbacks. Please try again."
          );
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [filterType, searchTerm, dateRange, page]
  );

  useEffect(() => {
    return () => {
      cancelPendingRequest();
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filterType, searchTerm, dateRange]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFeedbacks(0, false);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timeoutId);
      cancelPendingRequest();
    };
  }, [fetchFeedbacks]);

  const handleManualRetry = () => {
    fetchFeedbacks(0, true);
  };

  const handleDelete = async (feedbackId: number) => {
    try {
      await api.delete(`/feedback/${feedbackId}`);
      setFeedbacks(feedbacks.filter((feedback) => feedback.id !== feedbackId));
    } catch (error) {
      console.error("Error deleting feedback:", error);
      setError("Failed to delete feedback. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString("en-US", { month: "long" });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  return (
    <Box>
      {loading ? (
        <LoadingContainer>
          <CircularProgress size={40} />
          {retryCount > 0 && (
            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
              Retrying... Attempt {retryCount + 1}/3
            </Typography>
          )}
        </LoadingContainer>
      ) : error ? (
        <StyledPaper>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={handleManualRetry}>
            Try Again
          </Button>
        </StyledPaper>
      ) : (
        <>
          {feedbacks.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
              No feedback found
            </Typography>
          ) : (
            <Stack spacing={2}>
              {feedbacks.map((feedback) => (
                <StyledPaper key={feedback.id}>
                  <Typography variant="subtitle1" gutterBottom>
                    From: {feedback.from_user.name} ({feedback.from_user.role})
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    To: {feedback.to_user.name} ({feedback.to_user.role})
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {formatDate(feedback.created_at)}
                  </Typography>

                  {feedback.rating > 0 && (
                    <Box sx={{ my: 1 }}>
                      <Rating value={feedback.rating} readOnly />
                      <Typography variant="body2" sx={{ ml: 1, display: 'inline' }}>
                        ({feedback.rating})
                      </Typography>
                    </Box>
                  )}

                  {feedback.message && (
                    <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                      {feedback.message}
                    </Typography>
                  )}

                  {showControls &&
                    (user?.role === "admin" ||
                      user?.role === "support_staff" ||
                      feedback.from_id === user?.user_id) && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(feedback.id)}
                      sx={{ mt: 1 }}
                    >
                      Delete
                    </Button>
                  )}
                </StyledPaper>
              ))}

              {paginationInfo && paginationInfo.pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={paginationInfo.pages}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                  />
                </Box>
              )}
            </Stack>
          )}
        </>
      )}
    </Box>
  );
};

export default FeedbackList;
