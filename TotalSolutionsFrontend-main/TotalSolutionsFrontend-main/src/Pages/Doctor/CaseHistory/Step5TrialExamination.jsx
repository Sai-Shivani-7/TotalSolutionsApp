import { useEffect } from "react";

export default function Step5TrialExamination({ formData, updateFormData }) {
  const data = formData.trialExamination;

  const handleFieldChange = (field, value) => {
    updateFormData("trialExamination", (prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTrialChange = (index, field, value) => {
    updateFormData("trialExamination", (prev) => {
      const updated = { ...prev };
      const trials = [...updated.trials];
      trials[index] = { ...trials[index], [field]: value };
      updated.trials = trials;
      return updated;
    });
  };

  // Auto-calculate total score and percentage
  useEffect(() => {
    let totalAchieved = 0;
    let totalMax = 0;

    data.trials.forEach((trial) => {
      const achieved = parseFloat(trial.achievedScore) || 0;
      const max = parseFloat(trial.maxScore) || 0;
      totalAchieved += achieved;
      totalMax += max;
    });

    const percentage = totalMax > 0 ? Math.round((totalAchieved / totalMax) * 100) : 0;

    updateFormData("trialExamination", (prev) => ({
      ...prev,
      totalScore: totalAchieved,
      percentage: percentage,
    }));
  }, [data.trials]);

  return (
    <div>
      <h2 className="text-xl font-bold text-[#ab1c1c] mb-6">
        Trial Examination
      </h2>

      {/* Target Behaviour */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Behaviour
        </label>
        <input
          type="text"
          value={data.targetBehaviour}
          onChange={(e) => handleFieldChange("targetBehaviour", e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
          placeholder="Describe the target behaviour"
        />
      </div>

      {/* Trials Table */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-[#ab1c1c] mb-4">
          Trials
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-3 text-gray-600">Trial</th>
                <th className="text-left p-3 text-gray-600">Prompt Used</th>
                <th className="text-center p-3 text-gray-600">
                  Max Score Expected
                </th>
                <th className="text-center p-3 text-gray-600">
                  Achieved Score
                </th>
              </tr>
            </thead>
            <tbody>
              {data.trials.map((trial, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="p-3 font-medium text-gray-700">
                    Trial {index + 1}
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={trial.promptUsed}
                      onChange={(e) =>
                        handleTrialChange(index, "promptUsed", e.target.value)
                      }
                      className="w-full p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
                      placeholder="Prompt used"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={trial.maxScore}
                      onChange={(e) =>
                        handleTrialChange(index, "maxScore", e.target.value)
                      }
                      className="w-full p-1.5 border border-gray-300 rounded text-center focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
                      placeholder="Max"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={trial.achievedScore}
                      onChange={(e) =>
                        handleTrialChange(index, "achievedScore", e.target.value)
                      }
                      className="w-full p-1.5 border border-gray-300 rounded text-center focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
                      placeholder="Achieved"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 flex justify-end gap-6 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm">
            <span className="text-gray-600">Total Score: </span>
            <span className="font-bold text-[#ab1c1c]">{data.totalScore}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Percentage: </span>
            <span className="font-bold text-[#ab1c1c]">{data.percentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
