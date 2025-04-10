import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Box,
  Chip,
  SelectChangeEvent,
} from "@mui/material";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  includeAllOption?: boolean;
}

interface SubSelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  classId: string;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ClassSelect: React.FC<SelectProps> = ({
  value,
  onChange,
  label,
  includeAllOption,
}) => {
  const classOptions = [
    ...(includeAllOption ? ["all"] : []),
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
  ];

  const selectedClasses = value ? value.split(",").map((c) => c.trim()) : [];

  const handleChange = (event: SelectChangeEvent<typeof selectedClasses>) => {
    const value = event.target.value;
    // On autofill we get a stringified value.
    const newValue = typeof value === "string" ? value.split(",") : value;
    onChange(newValue.join(", "));
  };

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={selectedClasses}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value) => (
              <Chip
                key={value}
                label={value === "all" ? "All Classes" : value}
              />
            ))}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {classOptions.map((classOption) => (
          <MenuItem key={classOption} value={classOption}>
            <Checkbox checked={selectedClasses.indexOf(classOption) > -1} />
            <ListItemText
              primary={classOption === "all" ? "All Classes" : classOption}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const SubjectSelect: React.FC<SubSelectProps> = ({
  value,
  onChange,
  label,
  classId,
}) => {
  const getSubjectOptions = (classId: string) => {
    const classNumber = parseInt(classId.split(" ")[1]);
    if (classNumber >= 1 && classNumber <= 10) {
      return [
        "Mathematics",
        "Science",
        "English",
        "Hindi",
        "Social Science",
        "Computer Science",
      ];
    } else if (classNumber >= 11 && classNumber <= 12) {
      return [
        "Physics",
        "Chemistry",
        "Biology",
        "Mathematics",
        "Computer Science",
        "English",
        "Physical Education",
        "Economics",
        "Accontancy",
        "Business Studies",
        "Informatics Practices",
        "History",
        "Political Science",
        "Geography",
        "Sociology",
      ];
    }
    return []; // fallback empty array for invalid class
  };

  const subjectOptions = getSubjectOptions(classId);
  const selectedSubjects = value ? value.split(",").map((s) => s.trim()) : [];

  const handleChange = (event: SelectChangeEvent<typeof selectedSubjects>) => {
    const value = event.target.value;
    // On autofill we get a stringified value.
    const newValue = typeof value === "string" ? value.split(",") : value;
    onChange(newValue.join(", "));
  };

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={selectedSubjects}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={value} />
            ))}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {subjectOptions.map((subject) => (
          <MenuItem key={subject} value={subject}>
            <Checkbox checked={selectedSubjects.indexOf(subject) > -1} />
            <ListItemText primary={subject} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export { ClassSelect, SubjectSelect };
