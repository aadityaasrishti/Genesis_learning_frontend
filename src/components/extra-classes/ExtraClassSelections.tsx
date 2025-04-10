import { useState, useEffect } from "react";

interface ExtraClassSelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  teacherClasses?: string;
  teacherSubjects?: string;
}

const ExtraClassClassSelect: React.FC<ExtraClassSelectProps> = ({
  value,
  onChange,
  label,
  teacherClasses,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [classOptions, setClassOptions] = useState<string[]>([]);

  useEffect(() => {
    if (teacherClasses) {
      // Use teacher's assigned classes if available
      setClassOptions(teacherClasses.split(",").map((c) => c.trim()));
    } else {
      // Default class options for non-teachers
      setClassOptions([
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
      ]);
    }
  }, [teacherClasses]);

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="select-container">
        <div className="select-field" onClick={() => setIsOpen(!isOpen)}>
          {value || "Select Class"}
          <span className="select-arrow">▼</span>
        </div>

        {isOpen && (
          <div className="dropdown-content">
            {classOptions.map((classOption: string) => (
              <div
                key={classOption}
                className={`dropdown-item ${
                  value === classOption ? "selected" : ""
                }`}
                onClick={() => {
                  onChange(classOption);
                  setIsOpen(false);
                }}
              >
                {classOption}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ExtraClassSubjectSelect: React.FC<ExtraClassSelectProps> = ({
  value,
  onChange,
  label,
  teacherSubjects,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);

  useEffect(() => {
    if (teacherSubjects) {
      // Use teacher's subjects if available
      setSubjectOptions(teacherSubjects.split(",").map((s) => s.trim()));
    } else {
      // Default subject options for non-teachers
      setSubjectOptions([
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "History",
        "Geography",
        "Literature",
        "Computer Science",
        "Physical Education",
        "Art",
        "Music",
        "Environmental Science",
      ]);
    }
  }, [teacherSubjects]);

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="select-container">
        <div className="select-field" onClick={() => setIsOpen(!isOpen)}>
          {value || "Select Subject"}
          <span className="select-arrow">▼</span>
        </div>

        {isOpen && (
          <div className="dropdown-content">
            {subjectOptions.map((subject: string) => (
              <div
                key={subject}
                className={`dropdown-item ${
                  value === subject ? "selected" : ""
                }`}
                onClick={() => {
                  onChange(subject);
                  setIsOpen(false);
                }}
              >
                {subject}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { ExtraClassClassSelect, ExtraClassSubjectSelect };
