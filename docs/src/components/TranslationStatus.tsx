import type React from "react";

type TranslationStatus = {
  name: string;
  code: string;
  completed: number;
  missing: number;
  percent: number;
};

export const TranslationStatus: React.FC<{ data: TranslationStatus[] }> = ({ data }) => {
  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th style={{ padding: "8px", textAlign: "left" }}>Language</th>
          <th style={{ padding: "8px", textAlign: "right" }}>Completed</th>
          <th style={{ padding: "8px", textAlign: "right" }}>Missing</th>
          <th style={{ padding: "8px", textAlign: "right" }}>Percent Complete</th>
        </tr>
      </thead>
      <tbody>
        {data.map(({ name, code, completed, missing, percent }) => {
          return (
            <tr key={code}>
              <td style={{ padding: "8px" }}>
                {name} ({code})
              </td>
              <td style={{ padding: "8px" }}>{completed}</td>
              <td style={{ padding: "8px" }}>{missing}</td>
              <td style={{ padding: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "8ch" }}>{percent}%</span>
                  <progress value={completed} max={completed + missing} />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
