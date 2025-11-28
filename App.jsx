import React, { useReducer, useState, useEffect } from "react";

// AttendanceTracker.jsx
// Single-file React component using useReducer to manage a student attendance list.
// Tailwind classes are used for styling (remove/replace if you are not using Tailwind).

const initialStudents = [
  { id: 1, name: "Alice", status: "Not Marked" },
  { id: 2, name: "Bob", status: "Not Marked" },
  { id: 3, name: "Charlie", status: "Not Marked" },
  { id: 4, name: "David", status: "Not Marked" }
];

function reducer(state, action) {
  switch (action.type) {
    case "MARK_PRESENT":
      return state.map((s) =>
        s.id === action.payload.id ? { ...s, status: "Present" } : s
      );

    case "MARK_ABSENT":
      return state.map((s) =>
        s.id === action.payload.id ? { ...s, status: "Absent" } : s
      );

    case "RESET":
      return state.map((s) => ({ ...s, status: "Not Marked" }));

    case "ADD_STUDENT":
      // payload: { name }
      const nextId = state.length ? Math.max(...state.map((s) => s.id)) + 1 : 1;
      return [...state, { id: nextId, name: action.payload.name, status: "Not Marked" }];

    case "REMOVE_STUDENT":
      return state.filter((s) => s.id !== action.payload.id);

    default:
      return state;
  }
}

export default function AttendanceTracker() {
  const [students, dispatch] = useReducer(reducer, initialStudents, (init) => {
    try {
      const raw = localStorage.getItem("attendance_state");
      return raw ? JSON.parse(raw) : init;
    } catch (e) {
      return init;
    }
  });

  const [newName, setNewName] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("attendance_state", JSON.stringify(students));
    } catch (e) {
      // ignore
    }
  }, [students]);

  const presentCount = students.filter((s) => s.status === "Present").length;
  const absentCount = students.filter((s) => s.status === "Absent").length;

  function handleAdd(e) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    dispatch({ type: "ADD_STUDENT", payload: { name: trimmed } });
    setNewName("");
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-semibold mb-4">Student Attendance Tracker</h1>

      <div className="mb-4 flex gap-4 items-center">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Add student name"
            className="px-3 py-2 border rounded"
          />
          <button className="px-3 py-2 rounded bg-blue-600 text-white" type="submit">
            Add
          </button>
        </form>

        <button
          onClick={() => dispatch({ type: "RESET" })}
          className="px-3 py-2 rounded bg-gray-200"
        >
          Reset All
        </button>

        <div className="ml-auto text-sm text-gray-600">
          Present: <strong>{presentCount}</strong> • Absent: <strong>{absentCount}</strong>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left">
              <th className="border-b p-2">#</th>
              <th className="border-b p-2">Name</th>
              <th className="border-b p-2">Status</th>
              <th className="border-b p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="p-2 align-top">{idx + 1}</td>
                <td className="p-2 align-top">{s.name}</td>
                <td className="p-2 align-top">
                  <span
                    className={`px-2 py-1 rounded text-sm inline-block 
                      ${s.status === "Present" ? "bg-green-100 text-green-800" : ""} 
                      ${s.status === "Absent" ? "bg-red-100 text-red-800" : ""} 
                      ${s.status === "Not Marked" ? "bg-yellow-50 text-yellow-800" : ""}`.replace(/\s+/g, " ")}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="p-2 align-top flex gap-2">
                  <button
                    onClick={() => dispatch({ type: "MARK_PRESENT", payload: { id: s.id } })}
                    className="px-2 py-1 rounded bg-green-600 text-white text-sm"
                  >
                    Mark Present
                  </button>

                  <button
                    onClick={() => dispatch({ type: "MARK_ABSENT", payload: { id: s.id } })}
                    className="px-2 py-1 rounded bg-red-600 text-white text-sm"
                  >
                    Mark Absent
                  </button>

                  <button
                    onClick={() => dispatch({ type: "REMOVE_STUDENT", payload: { id: s.id } })}
                    className="px-2 py-1 rounded bg-gray-300 text-sm"
                    title="Remove student"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-sm text-gray-700">
        <h2 className="font-medium">Final attendance (table format)</h2>
        <pre className="mt-2 bg-gray-50 p-3 rounded overflow-x-auto text-sm">
          {students.map((s) => `${s.id}\t${s.name}\t${s.status}`).join('\n')}
        </pre>
      </div>
    </div>
  );
}
