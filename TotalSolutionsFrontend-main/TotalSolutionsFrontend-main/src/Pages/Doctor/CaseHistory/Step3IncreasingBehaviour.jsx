export default function Step3IncreasingBehaviour({ formData, updateFormData }) {
  const data = formData.increasingBehaviour;

  const handleFieldChange = (field, value) => {
    updateFormData("increasingBehaviour", (prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGoalChange = (index, field, value) => {
    updateFormData("increasingBehaviour", (prev) => {
      const updated = { ...prev };
      const goals = [...updated.shortTermGoals];
      goals[index] = { ...goals[index], [field]: value };
      updated.shortTermGoals = goals;
      return updated;
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[#ab1c1c] mb-6">
        IBP – Increasing
      </h2>

      {/* Increasing Behaviour Section */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <h3 className="text-lg font-semibold text-[#ab1c1c]">
            Increasing Behaviour I
          </h3>
        </div>

        {/* Long Term Goal */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Long Term Goal
          </label>
          <input
            type="text"
            value={data.longTermGoal}
            onChange={(e) => handleFieldChange("longTermGoal", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
            placeholder="Enter long term goal"
          />
        </div>

        {/* Short Term Goals Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-2 text-gray-600">
                  Short Term Goals
                </th>
                <th className="text-center p-2 text-gray-600 w-24">Month 1</th>
                <th className="text-center p-2 text-gray-600 w-24">Month 2</th>
                <th className="text-center p-2 text-gray-600 w-24">Month 3</th>
              </tr>
            </thead>
            <tbody>
              {data.shortTermGoals.map((goal, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-[#ab1c1c] rounded focus:ring-[#ab1c1c]"
                      />
                      <input
                        type="text"
                        value={goal.text}
                        onChange={(e) =>
                          handleGoalChange(index, "text", e.target.value)
                        }
                        className="flex-1 p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
                        placeholder={`Concern ${index + 1}`}
                      />
                    </div>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={goal.month1}
                      onChange={(e) =>
                        handleGoalChange(index, "month1", e.target.value)
                      }
                      className="w-full p-1.5 border border-gray-300 rounded text-center focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={goal.month2}
                      onChange={(e) =>
                        handleGoalChange(index, "month2", e.target.value)
                      }
                      className="w-full p-1.5 border border-gray-300 rounded text-center focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={goal.month3}
                      onChange={(e) =>
                        handleGoalChange(index, "month3", e.target.value)
                      }
                      className="w-full p-1.5 border border-gray-300 rounded text-center focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Material Used */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span>✨</span> Material Used for Increasing Behaviours
        </h3>
        <textarea
          value={data.materialUsed}
          onChange={(e) => handleFieldChange("materialUsed", e.target.value)}
          rows={2}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
          placeholder="Describe materials used..."
        />
      </div>

      {/* Methods Used */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span>⚙️</span> Methods Used for Increasing Behaviour
        </h3>
        <textarea
          value={data.methodsUsed}
          onChange={(e) => handleFieldChange("methodsUsed", e.target.value)}
          rows={2}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
          placeholder="Describe methods used..."
        />
      </div>

      {/* Parental Involvement */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-[#ab1c1c] mb-2 flex items-center gap-2">
          <span>✦</span> Parental Involvement
        </h3>
        <textarea
          value={data.parentalInvolvement}
          onChange={(e) =>
            handleFieldChange("parentalInvolvement", e.target.value)
          }
          rows={2}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
          placeholder="Describe parental involvement..."
        />
      </div>

      {/* Overall Feedback */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="w-4 h-4 text-[#ab1c1c] rounded focus:ring-[#ab1c1c]"
          />
          <span className="text-sm text-gray-700">
            Overall any feedback / any change / reason of change
          </span>
        </label>
        <textarea
          value={data.overallFeedback}
          onChange={(e) => handleFieldChange("overallFeedback", e.target.value)}
          rows={2}
          className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
          placeholder="Feedback..."
        />
      </div>
    </div>
  );
}
