import React, { useState, useEffect } from "react";
import api from "../../services/api";

interface Student {
  user_id: number;
  name: string;
  email: string;
  class?: string; // Added optional class field
  subjects?: string; // Added optional subjects field
  student?: {
    class_id: string;
    subjects: string;
  };
}

interface Props {
  classId: string;
  subject: string;
  onStudentsSelect: (selectedIds: string[]) => void;
}

const StudentSelector: React.FC<Props> = ({
  classId,
  subject,
  onStudentsSelect,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classId && subject) {
      fetchStudents();
    }
  }, [classId, subject]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Updated to use the correct endpoint
      const response = await api.get("/tests/available-students", {
        params: {
          class: classId,
          subject: subject,
        },
      });

      if (!response.data) {
        throw new Error("No data received from server");
      }

      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
      onStudentsSelect([]);
    } else {
      const allIds = students.map((s) => s.user_id.toString());
      setSelectedStudents(allIds);
      onStudentsSelect(allIds);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    const newSelection = selectedStudents.includes(studentId)
      ? selectedStudents.filter((id) => id !== studentId)
      : [...selectedStudents, studentId];

    setSelectedStudents(newSelection);
    onStudentsSelect(newSelection);
  };

  if (loading) {
    return (
      <div className="loading-indicator">
        <p>Loading students...</p>
      </div>
    );
  }

  if (!students.length) {
    return (
      <div className="no-students-message">
        <p>No students found for this class and subject.</p>
      </div>
    );
  }

  return (
    <div className="student-selector">
      <div className="selector-header">
        <button
          type="button"
          onClick={handleSelectAll}
          className="select-all-btn"
        >
          {selectedStudents.length === students.length
            ? "Deselect All"
            : "Select All"}
        </button>
        <span className="selection-count">
          Selected {selectedStudents.length} of {students.length} students
        </span>
      </div>
      <div className="students-list">
        {students.map((student) => (
          <div key={student.user_id} className="student-item">
            <label>
              <input
                type="checkbox"
                checked={selectedStudents.includes(student.user_id.toString())}
                onChange={() => handleStudentSelect(student.user_id.toString())}
              />
              <div className="student-info">
                <span className="student-name">{student.name}</span>
                <span className="student-email">{student.email}</span>
                <div className="student-details">
                  <span className="student-classes">
                    Classes:{" "}
                    {(student.student?.class_id || student.class || "")
                      .split(",")
                      .map((c: string) => c.trim())
                      .join(", ")}
                  </span>
                  <span className="student-subjects">
                    Subjects:{" "}
                    {(student.student?.subjects || student.subjects || "")
                      .split(",")
                      .map((s: string) => s.trim())
                      .join(", ")}
                  </span>
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentSelector;
