export default function Step4DecreasingBehaviour({ formData, updateFormData }) {
  const data = formData.decreasingBehaviour;

  const handleFieldChange = (field, value) => {
    updateFormData("decreasingBehaviour", (prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRowChange = (index, field, value) => {
    updateFormData("decreasingBehaviour", (prev) => {
      const updated = { ...prev };
      const rows = [...updated.rows];
      rows[index] = { ...rows[index], [field]: value };
      updated.rows = rows;
      return updated;
    });
  };

  // Calculate total and percentage
  const calculateTotal = () => {
    let total = 0;
    data.rows.forEach((row) => {
      const m1 = parseFloat(row.month1) || 0;
      const m2 = parseFloat(row.month2) || 0;
      const m3 = parseFloat(row.month3) || 0;
      total += m1 + m2 + m3;
    });
    return total;
  };

  const calculatePercentage = () => {
    const total = calculateTotal();
    const maxPossible = data.rows.length * 3 * 10; // assuming max score 10 per cell
    return maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0;
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[#ab1c1c] mb-6">
        IBP – Decreasing
      </h2>

      {/* Decreasing Behaviour Table */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <h3 className="text-lg font-semibold text-[#ab1c1c]">
            Decreasing Behaviour I
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-2 text-gray-600"></th>
                <th className="text-center p-2 text-gray-600 w-24">Month 1</th>
                <th className="text-center p-2 text-gray-600 w-24">Month 2</th>
                <th className="text-center p-2 text-gray-600 w-24">Month 3</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${index % 2 === 0 ? "bg-blue-400" : "bg-orange-400"
                          }`}
                      />
                      <span className="text-gray-700 font-medium">
                        {row.type}
                      </span>
                    </div>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.month1}
                      onChange={(e) =>
                        handleRowChange(index, "month1", e.target.value)
                      }
                      className="w-full p-1.5 border border-gray-300 rounded text-center focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.month2}
                      onChange={(e) =>
                        handleRowChange(index, "month2", e.target.value)
                      }
                      className="w-full p-1.5 border border-gray-300 rounded text-center focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.month3}
                      onChange={(e) =>
                        handleRowChange(index, "month3", e.target.value)
                      }
                      className="w-full p-1.5 border border-gray-300 rounded text-center focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="border-t-2 border-gray-300">
                <td className="p-2 font-medium text-gray-700">Total</td>
                <td colSpan={2} className="p-2 text-right font-medium text-gray-600">
                  Percentage
                </td>
                <td className="p-2">
                  <div className="text-center font-bold text-[#ab1c1c]">
                    {calculatePercentage()}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Rewards for Consequences */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span>■</span> Rewards for Consequences as Decided
        </h3>
        <textarea
          value={data.rewardsForConsequences}
          onChange={(e) =>
            handleFieldChange("rewardsForConsequences", e.target.value)
          }
          rows={2}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
          placeholder="Describe rewards for consequences..."
        />
      </div>

      {/* Methods Used */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span>■</span> Methods Used for Decreasing Behaviour
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
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span>●</span> Parental Involvement
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
    </div>
  );
}
