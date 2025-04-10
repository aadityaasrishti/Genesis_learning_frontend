import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Button,
  CircularProgress,
  Alert,
  SelectChangeEvent,
  Switch,
  FormControlLabel,
  IconButton,
  Paper,
  Pagination,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { styled } from "@mui/material/styles";
import api from "../../services/api";
import {
  bulkCreateMCQQuestions,
  createMCQQuestion,
} from "../../services/mcqService";

interface QuestionData {
  class_id: string;
  subject: string;
  chapter: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  image?: File;
}

const emptyQuestion = {
  class_id: "",
  subject: "",
  chapter: "",
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: -1,
};

// Add CSV file upload styling
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

// Add a constant for items per page
const QUESTIONS_PER_PAGE = 10;

export const TeacherMCQForm = () => {
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState<QuestionData>(emptyQuestion);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkQuestions, setBulkQuestions] = useState<QuestionData[]>([
    emptyQuestion,
  ]);
  const [commonFields, setCommonFields] = useState({
    class_id: "",
    subject: "",
    chapter: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await api.get("/auth/teacher-data");
        setClasses(response.data.classes || []);
        setSubjects(response.data.subjects || []);
        setError("");
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch teacher data");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBulkInputChange = (index: number, field: string, value: any) => {
    setBulkQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCommonFieldChange = (field: string, value: string) => {
    setCommonFields((prev) => ({ ...prev, [field]: value }));
    // Update all questions with the new common field value
    setBulkQuestions((prev) => prev.map((q) => ({ ...q, [field]: value })));
  };

  const handleOptionChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const handleBulkOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setBulkQuestions((prev) => {
      const updated = [...prev];
      const newOptions = [...updated[questionIndex].options];
      newOptions[optionIndex] = value;
      updated[questionIndex] = {
        ...updated[questionIndex],
        options: newOptions,
      };
      return updated;
    });
  };

  const addQuestion = () => {
    setBulkQuestions((prev) => [
      ...prev,
      {
        ...emptyQuestion,
        class_id: commonFields.class_id,
        subject: commonFields.subject,
        chapter: commonFields.chapter,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setBulkQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isBulkMode) {
        // Validate common fields and questions
        if (!commonFields.class_id || !commonFields.subject || !commonFields.chapter) {
          throw new Error("Please fill in class, subject, and chapter fields");
        }

        const validQuestions = bulkQuestions.every(
          (q) =>
            q.questionText &&
            q.options.every((opt) => opt.trim()) &&
            q.correctAnswer >= 0
        );

        if (!validQuestions) {
          throw new Error("Please fill all required fields for all questions");
        }

        // Create FormData for bulk questions
        const formData = new FormData();
        bulkQuestions.forEach((question) => {
          if (question.image) {
            formData.append('images', question.image);
          }
        });
        formData.append('questions', JSON.stringify(bulkQuestions.map(q => ({
          class_id: commonFields.class_id,
          subject: commonFields.subject,
          chapter: commonFields.chapter,
          question_text: q.questionText,
          options: q.options,
          correct_answer: q.correctAnswer,
        }))));

        await bulkCreateMCQQuestions(formData);
        setBulkQuestions([{ ...emptyQuestion, ...commonFields }]);
        setSuccess("Successfully created all questions!");
      } else {
        // Validate single question fields
        if (!formData.questionText || !formData.options.every(opt => opt.trim()) || formData.correctAnswer < 0) {
          throw new Error("Please fill all required fields");
        }

        // Create FormData for single question
        const singleFormData = new FormData();
        if (formData.image) {
          singleFormData.append('image', formData.image);
        }
        singleFormData.append('class_id', formData.class_id);
        singleFormData.append('subject', formData.subject);
        singleFormData.append('chapter', formData.chapter);
        singleFormData.append('question_text', formData.questionText);
        singleFormData.append('options', JSON.stringify(formData.options));
        singleFormData.append('correct_answer', String(formData.correctAnswer));

        await createMCQQuestion(singleFormData);
        setFormData({ ...emptyQuestion });
        setSuccess("Question created successfully!");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Failed to create questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const validateCsvHeaders = (headers: string[]) => {
    const requiredHeaders = [
      "question_text",
      "option1",
      "option2",
      "option3",
      "option4",
      "correct_answer",
    ];
    return requiredHeaders.every((header) =>
      headers.map((h) => h.trim().toLowerCase()).includes(header.toLowerCase())
    );
  };

  // Add number validation helper
  const isValidNumber = (value: string) => {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
  };

  const handleCsvUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError("");
    setSuccess("");
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!file.name.endsWith(".csv")) {
        setError("Please upload a CSV file");
        return;
      }

      try {
        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
          if (e.target?.result) {
            const csvText = e.target.result as string;

            // Split into rows and clean up any BOM characters and extra whitespace
            const rows = csvText
              .replace(/^\uFEFF/, "") // Remove BOM if present
              .split(/[\r\n]+/)
              .map((row) => row.trim())
              .filter((row) => row.length > 0);

            if (rows.length < 2) {
              throw new Error(
                "CSV file must contain a header row and at least one question"
              );
            }

            // Handle quoted CSV values properly
            const parseRow = (row: string): string[] => {
              const values: string[] = [];
              let currentValue = "";
              let insideQuotes = false;

              for (let i = 0; i < row.length; i++) {
                const char = row[i];

                if (char === '"') {
                  insideQuotes = !insideQuotes;
                } else if (char === "," && !insideQuotes) {
                  values.push(currentValue.trim());
                  currentValue = "";
                } else {
                  currentValue += char;
                }
              }
              values.push(currentValue.trim());
              return values.map((v) => v.replace(/^"|"$/g, "").trim());
            };

            const headers = parseRow(rows[0]);
            console.log("CSV Headers:", headers); // Debug log

            // Validate CSV structure
            if (!validateCsvHeaders(headers)) {
              throw new Error(
                "Invalid CSV format. Required columns: question_text, option1, option2, option3, option4, correct_answer"
              );
            }

            try {
              // Parse CSV data into questions in chunks
              const parsedQuestions: QuestionData[] = [];
              const dataRows = rows.slice(1);

              for (let i = 0; i < dataRows.length; i++) {
                const row = dataRows[i];
                const values = parseRow(row);

                console.log(`Processing row ${i + 1}:`, values); // Debug log

                if (values.length !== headers.length) {
                  console.warn(`Skipping row ${i + 1}: Invalid column count`);
                  continue;
                }

                const rowData: Record<string, string> = {};
                headers.forEach((header, index) => {
                  rowData[header.trim().toLowerCase()] = values[index];
                });

                // Validate row data
                if (!rowData.question_text?.trim()) {
                  console.warn(`Skipping row ${i + 1}: Missing question text`);
                  continue;
                }

                const options = [
                  rowData.option1?.trim(),
                  rowData.option2?.trim(),
                  rowData.option3?.trim(),
                  rowData.option4?.trim(),
                ];

                // Validate numeric options
                if (options.some((opt) => !opt || !isValidNumber(opt))) {
                  console.warn(
                    `Skipping row ${i + 1}: Invalid numeric options`
                  );
                  continue;
                }

                const correctAnswer = parseInt(rowData.correct_answer);
                if (
                  isNaN(correctAnswer) ||
                  correctAnswer < 1 ||
                  correctAnswer > 4
                ) {
                  console.warn(`Skipping row ${i + 1}: Invalid correct answer`);
                  continue;
                }

                parsedQuestions.push({
                  questionText: rowData.question_text,
                  options,
                  correctAnswer: correctAnswer - 1, // Convert to 0-based index
                  class_id: commonFields.class_id,
                  subject: commonFields.subject,
                  chapter: commonFields.chapter,
                });
              }

              console.log("Total parsed questions:", parsedQuestions.length); // Debug log

              if (parsedQuestions.length === 0) {
                throw new Error(
                  "No valid questions found in the CSV file. Please check the file format and contents."
                );
              }

              // Update bulk questions and pagination
              setBulkQuestions(parsedQuestions);
              setTotalPages(
                Math.ceil(parsedQuestions.length / QUESTIONS_PER_PAGE)
              );
              setCurrentPage(1);
              setSuccess(
                `CSV file parsed successfully! ${parsedQuestions.length} questions loaded. Review the questions before submitting.`
              );
            } catch (err: any) {
              throw new Error(`Failed to parse questions: ${err.message}`);
            }
          }
        };

        reader.onerror = () => {
          setError("Failed to read the CSV file. Please try again.");
        };

        reader.readAsText(file);
      } catch (err: any) {
        setError(
          "Failed to parse CSV file: " + (err.message || "Unknown error")
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // Add pagination handlers
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  // Get current page questions
  const getCurrentPageQuestions = () => {
    const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const endIndex = startIndex + QUESTIONS_PER_PAGE;
    return bulkQuestions.slice(startIndex, endIndex);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderCommonFields = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Common Details
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Class</InputLabel>
        <Select
          value={commonFields.class_id}
          label="Class"
          onChange={(e: SelectChangeEvent) =>
            handleCommonFieldChange("class_id", e.target.value)
          }
          required
        >
          {classes.map((cls) => (
            <MenuItem key={cls} value={cls}>
              {cls}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Subject</InputLabel>
        <Select
          value={commonFields.subject}
          label="Subject"
          onChange={(e: SelectChangeEvent) =>
            handleCommonFieldChange("subject", e.target.value)
          }
          required
        >
          {subjects.map((subject) => (
            <MenuItem key={subject} value={subject}>
              {subject}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        margin="normal"
        label="Chapter"
        value={commonFields.chapter}
        onChange={(e) => handleCommonFieldChange("chapter", e.target.value)}
        required
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Import Questions from CSV
        </Typography>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{ mb: 2 }}
          disabled={
            !commonFields.class_id ||
            !commonFields.subject ||
            !commonFields.chapter
          }
        >
          Upload CSV File
          <VisuallyHiddenInput
            type="file"
            onChange={handleCsvUpload}
            accept=".csv"
          />
        </Button>
        <Typography variant="body2" color="text.secondary">
          CSV Format:
          question_text,option1,option2,option3,option4,correct_answer
        </Typography>
        {(!commonFields.class_id ||
          !commonFields.subject ||
          !commonFields.chapter) && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Please fill in all common details before uploading CSV
          </Typography>
        )}
      </Box>
    </Paper>
  );

  const renderQuestionFields = (data: QuestionData, index?: number) => {
    const handleOptChange =
      index !== undefined
        ? (optIndex: number, value: string) =>
            handleBulkOptionChange(index, optIndex, value)
        : handleOptionChange;

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (index !== undefined) {
          setBulkQuestions((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], image: file };
            return updated;
          });
        } else {
          setFormData((prev) => ({ ...prev, image: file }));
        }
      }
    };

    return (
      <Box key={index} sx={{ mb: index !== undefined ? 4 : 0 }}>
        {index !== undefined && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Question {index + 1}</Typography>
            {bulkQuestions.length > 1 && (
              <IconButton onClick={() => removeQuestion(index)} color="error">
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        )}

        {!isBulkMode && (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Class</InputLabel>
              <Select
                value={data.class_id}
                label="Class"
                onChange={(e: SelectChangeEvent) =>
                  handleInputChange("class_id", e.target.value)
                }
                required
              >
                {classes.map((cls) => (
                  <MenuItem key={cls} value={cls}>
                    {cls}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Subject</InputLabel>
              <Select
                value={data.subject}
                label="Subject"
                onChange={(e: SelectChangeEvent) =>
                  handleInputChange("subject", e.target.value)
                }
                required
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Chapter"
              value={data.chapter}
              onChange={(e) => handleInputChange("chapter", e.target.value)}
              required
            />
          </>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<AddPhotoAlternateIcon />}
            sx={{ mt: 2 }}
          >
            Upload Image
            <VisuallyHiddenInput
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>
          {data.image && (
            <Typography variant="body2" color="primary">
              Image selected: {data.image.name}
            </Typography>
          )}
        </Box>

        <TextField
          fullWidth
          margin="normal"
          label="Question"
          multiline
          rows={3}
          value={data.questionText}
          onChange={(e) =>
            index !== undefined
              ? handleBulkInputChange(index, "questionText", e.target.value)
              : handleInputChange("questionText", e.target.value)
          }
          required
        />

        {data.options.map((option, optIndex) => (
          <TextField
            key={optIndex}
            fullWidth
            margin="normal"
            label={`Option ${optIndex + 1}`}
            value={option}
            onChange={(e) => handleOptChange(optIndex, e.target.value)}
            required
          />
        ))}

        <FormControl fullWidth margin="normal">
          <InputLabel>Correct Answer</InputLabel>
          <Select
            value={
              data.correctAnswer === -1 ? "" : data.correctAnswer.toString()
            }
            label="Correct Answer"
            onChange={(e: SelectChangeEvent) =>
              index !== undefined
                ? handleBulkInputChange(
                    index,
                    "correctAnswer",
                    parseInt(e.target.value)
                  )
                : handleInputChange("correctAnswer", parseInt(e.target.value))
            }
            required
          >
            {data.options.map((_, idx) => (
              <MenuItem key={idx} value={idx}>
                Option {idx + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Create MCQ Questions</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isBulkMode}
              onChange={(e) => {
                setIsBulkMode(e.target.checked);
                if (e.target.checked) {
                  setBulkQuestions([{ ...formData }]);
                  setCommonFields({
                    class_id: formData.class_id,
                    subject: formData.subject,
                    chapter: formData.chapter,
                  });
                } else {
                  setFormData(bulkQuestions[0] || emptyQuestion);
                }
              }}
            />
          }
          label="Bulk Mode"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {isBulkMode && renderCommonFields()}

        {isBulkMode ? (
          <>
            {getCurrentPageQuestions().map((q, localIndex) => {
              const globalIndex =
                (currentPage - 1) * QUESTIONS_PER_PAGE + localIndex;
              return renderQuestionFields(q, globalIndex);
            })}

            {bulkQuestions.length > QUESTIONS_PER_PAGE && (
              <Box
                sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}
              >
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setBulkQuestions([{ ...emptyQuestion, ...commonFields }]);
                  setTotalPages(1);
                  setCurrentPage(1);
                }}
                color="secondary"
                fullWidth
              >
                Clear All Questions
              </Button>
              <Button variant="outlined" onClick={addQuestion} fullWidth>
                Add Another Question
              </Button>
            </Box>
          </>
        ) : (
          renderQuestionFields(formData)
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading || (isBulkMode && bulkQuestions.length === 0)}
        >
          {loading
            ? "Creating..."
            : `Create ${isBulkMode ? "Questions" : "Question"}`}
        </Button>
      </form>
    </Box>
  );
};
