import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

import Step1Demographics from "./Step1Demographics";
import Step2DocumentsChecklist from "./Step2DocumentsChecklist";
import Step3IncreasingBehaviour from "./Step3IncreasingBehaviour";
import Step4DecreasingBehaviour from "./Step4DecreasingBehaviour";
import Step5TrialExamination from "./Step5TrialExamination";
import Step6ScreeningDrawingTest from "./Step6ScreeningDrawingTest";
import Step7AssessmentNotes from "./Step7AssessmentNotes";
import Step8MedicalHistoryForm from "./Step8MedicalHistoryForm";

const STEPS = [
  { label: "Child Demographics",   shortLabel: "Demographics",       component: Step1Demographics },
  { label: "Demographic Details",  shortLabel: "Demographic Details", component: Step8MedicalHistoryForm },
  { label: "Screening Drawing Test", shortLabel: "Screening Test",   component: Step6ScreeningDrawingTest },
  { label: "Assessment Notes",     shortLabel: "Assessment",         component: Step7AssessmentNotes },
  { label: "Documents Checklist",  shortLabel: "Documents",          component: Step2DocumentsChecklist },
  { label: "Increasing Behaviour", shortLabel: "IBP+",               component: Step3IncreasingBehaviour },
  { label: "Decreasing Behaviour", shortLabel: "IBP−",               component: Step4DecreasingBehaviour },
  { label: "Trial Examination",    shortLabel: "Trials",             component: Step5TrialExamination },
];

const initialFormData = {
  // Step 1
  childName: "",
  dob: "",
  dateOfJoining: "",
  therapistName: "",
  centre: "",
  fatherName: "",
  fatherPhone: "",
  fatherWhatsApp: "",
  fatherEmail: "",
  fatherOccupation: "",
  fatherQualifications: "",
  motherName: "",
  motherPhone: "",
  motherWhatsApp: "",
  motherEmail: "",
  motherOccupation: "",
  motherQualifications: "",
  address: "",
  preTherapyVideoRef: "",
  newTherapyAdded: "",
  newTherapyDate: "",
  newTherapistName: "",
  therapyStarted: [
    { type: "OT",             startedDate: "", therapistName: "", uploadRef: "" },
    { type: "BT",             startedDate: "", therapistName: "", uploadRef: "" },
    { type: "RT",             startedDate: "", therapistName: "", uploadRef: "" },
    { type: "ST",             startedDate: "", therapistName: "", uploadRef: "" },
    { type: "BM",             startedDate: "", therapistName: "", uploadRef: "" },
    { type: "Parent Training",startedDate: "", therapistName: "", uploadRef: "" },
  ],

  // Step 2
  consultationPaper: false,
  previousMedicalDocs: false,
  testReports: false,
  consentForm: false,
  parentConcerns: false,
  parentConcernsText: "",
  therapyChange: false,
  therapistChange: false,
  foodAllergy: false,

  // Step 3
  increasingBehaviour: {
    longTermGoal: "",
    shortTermGoals: Array.from({ length: 5 }, () => ({ text: "", month1: "", month2: "", month3: "" })),
    materialUsed: "",
    methodsUsed: "",
    parentalInvolvement: "",
    overallFeedback: "",
  },

  // Step 4
  decreasingBehaviour: {
    rows: [
      { type: "Attention Seeking",      month1: "", month2: "", month3: "" },
      { type: "Escape",                 month1: "", month2: "", month3: "" },
      { type: "Skill Deficit",          month1: "", month2: "", month3: "" },
      { type: "Tangible",               month1: "", month2: "", month3: "" },
      { type: "Automatic Reinforcement",month1: "", month2: "", month3: "" },
      { type: "Self Stimulation",       month1: "", month2: "", month3: "" },
    ],
    rewardsForConsequences: "",
    methodsUsed: "",
    parentalInvolvement: "",
  },

  // Step 5
  trialExamination: {
    targetBehaviour: "",
    trials: Array.from({ length: 5 }, () => ({ promptUsed: "", maxScore: "", achievedScore: "" })),
    totalScore: 0,
    percentage: 0,
  },

  // Step 6
  visualShapes: { childName: "", date: "" },

  // Step 7
  assessmentNotes: {
    cylinderResult: "",
    cubeResult: "",
    rectangleResponse: "",
    therapistNotes: "",
    observationNotes: "",
    recommendations: "",
    assessmentDate: "",
  },

  // Step 8
  medicalHistory: {
    presentingComplaints: "",
    referredBy: "",
    generalHistory: "",
    pregnancyHistory: "",
    pedigreeDrawingImage: "",
  },
};

function calculateAge(dobString) {
  if (!dobString) return "";
  const dob = new Date(dobString);
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years > 0) return `${years} yr${years > 1 ? "s" : ""} ${months} mo`;
  return `${months} mo`;
}

export default function CaseHistoryWizard() {
  const [children, setChildren]               = useState([]);
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [searchQuery, setSearchQuery]         = useState("");
  const [selectedChild, setSelectedChild]     = useState(null);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [showDropdown, setShowDropdown]       = useState(false);
  const dropdownRef = useRef(null);

  const [currentStep, setCurrentStep]     = useState(0);
  const [formData, setFormData]           = useState(initialFormData);
  const [visitedSteps, setVisitedSteps]   = useState(new Set([0]));
  const [isSaving, setIsSaving]           = useState(false);
  const [savedHistories, setSavedHistories]   = useState([]);
  const [loadingHistories, setLoadingHistories] = useState(false);
  const [readOnlyHistory, setReadOnlyHistory] = useState(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const contentRef = useRef(null);

  // Keep doctor auth token from session storage. Do not override with child token.
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }, []);

  // ─── Load children from backend ───────────────────────────────────────────
  useEffect(() => {
    const fetchChildren = async () => {
      setLoadingChildren(true);
      try {
        // Fetch only doctor's assigned children for the case history wizard
        const res = await axios.get("/api/doctors/assigned", {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        });
        setChildren(res.data);
        setFilteredChildren(res.data);
      } catch (err) {
        console.error("Failed to load children:", err.message);
        toast.error("Could not load children list.");
      } finally {
        setLoadingChildren(false);
      }
    };
    fetchChildren();
  }, []);

  // ─── Filter children by search ────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChildren(children);
    } else {
      setFilteredChildren(
        children.filter((c) =>
          (c.name || "").toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, children]);

  // ─── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Select child ──────────────────────────────────────────────────────────
  const handleSelectChild = async (child) => {
    try {
      setSelectedChild(child);
      setSearchQuery(child.name);
      setShowDropdown(false);
      setFormData((prev) => ({
        ...prev,
        childName: child.name || "",
        dob: child.dob ? child.dob.split("T")[0] : "",
        therapistName: child.therapistId?.name || "",
        centre: child.centreId?.name || "",
        visualShapes: { ...prev.visualShapes, childName: child.name || "" },
      }));
      await fetchSavedHistories(child._id);
      toast.success(`${child.name} selected.`);
    } catch (err) {
      console.error("Child select failed:", err.response?.data || err.message);
      toast.error("Failed to select child.");
      setSelectedChild(null);
    }
  };

  // ─── Fetch past histories ─────────────────────────────────────────────────
  const fetchSavedHistories = async (childId) => {
    setLoadingHistories(true);
    try {
      const res = await axios.get(`/api/cases/child/${childId}`);
      const histories = Array.isArray(res.data) ? res.data : [];
      setSavedHistories(histories);
      setReadOnlyHistory(histories.length ? histories[0] : null);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please re-select child.");
        setSelectedChild(null);
      }
      setSavedHistories([]);
      setReadOnlyHistory(null);
    } finally {
      setLoadingHistories(false);
    }
  };

  const loadHistoryIntoForm = (history) => {
    if (!history) return;

    const demo = history.demographics || {};
    const docs = history.documentsChecklist || {};
    
    // Ensure new fields are included
    const fatherOcc = demo.fatherOccupation || "";
    const fatherQual = demo.fatherQualifications || "";
    const motherOcc = demo.motherOccupation || "";
    const motherQual = demo.motherQualifications || "";

    setFormData({
      ...initialFormData,
      childName: demo.childName || "",
      dob: demo.dob || "",
      dateOfJoining: demo.dateOfJoining || "",
      therapistName: demo.therapistName || "",
      centre: demo.centre || "",
      fatherName: demo.fatherName || "",
      fatherPhone: demo.fatherPhone || "",
      fatherWhatsApp: demo.fatherWhatsApp || "",
      fatherEmail: demo.fatherEmail || "",
      fatherOccupation: fatherOcc,
      fatherQualifications: fatherQual,
      motherName: demo.motherName || "",
      motherPhone: demo.motherPhone || "",
      motherWhatsApp: demo.motherWhatsApp || "",
      motherEmail: demo.motherEmail || "",
      motherOccupation: motherOcc,
      motherQualifications: motherQual,
      address: demo.address || "",
      preTherapyVideoRef: demo.preTherapyVideoRef || "",
      newTherapyAdded: demo.newTherapyAdded || "",
      newTherapyDate: demo.newTherapyDate || "",
      newTherapistName: demo.newTherapistName || "",
      therapyStarted: demo.therapyStarted || initialFormData.therapyStarted,

      consultationPaper: docs.consultationPaper || false,
      previousMedicalDocs: docs.previousMedicalDocs || false,
      testReports: docs.testReports || false,
      consentForm: docs.consentForm || false,
      parentConcerns: docs.parentConcerns || false,
      parentConcernsText: docs.parentConcernsText || "",
      therapyChange: docs.therapyChange || false,
      therapistChange: docs.therapistChange || false,
      foodAllergy: docs.foodAllergy || false,

      increasingBehaviour:
        history.increasingBehaviourPlan || initialFormData.increasingBehaviour,
      decreasingBehaviour:
        history.decreasingBehaviourPlan || initialFormData.decreasingBehaviour,
      trialExamination:
        history.trialExamination || initialFormData.trialExamination,
      visualShapes: history.visualShapes || initialFormData.visualShapes,
      assessmentNotes:
        history.assessmentNotes || initialFormData.assessmentNotes,
      medicalHistory: (() => {
        const med = history.medicalHistory || {};

        let pregnancyHistory = med.pregnancyHistory || "";
        if (!pregnancyHistory) {
          const parts = [];
          if (med.prenatalHistory) parts.push(`Pre-natal: ${med.prenatalHistory}`);
          if (med.natalHistory) parts.push(`Natal: ${med.natalHistory}`);
          if (med.postnatalHistory) parts.push(`Post-natal: ${med.postnatalHistory}`);
          pregnancyHistory = parts.join("\n\n");
        }

        return {
          presentingComplaints: med.presentingComplaints || "",
          referredBy: med.referredBy || "",
          generalHistory: med.generalHistory || "",
          pregnancyHistory,
          pedigreeDrawingImage: med.pedigreeDrawingImage || "",
        };
      })(),
    });
  };

  // ─── Load a saved history into the wizard for editing ─────────────────────
  const handleEditHistory = () => {
    if (!readOnlyHistory) return;
    setIsEditingMode(true);
    setCurrentStep(0);
    setVisitedSteps(new Set([0]));
    loadHistoryIntoForm(readOnlyHistory);
    toast.info("Editing case history. Changes will update the existing record.");
  };

  const handleCancelEdit = () => {
    setIsEditingMode(false);
    setCurrentStep(0);
    setVisitedSteps(new Set([0]));
    if (readOnlyHistory) {
      loadHistoryIntoForm(readOnlyHistory);
    }
    toast.info("Edit cancelled.");
  };

  const handleAddCaseHistory = () => {
    setReadOnlyHistory(null);
    setIsEditingMode(false);
    setFormData(initialFormData);
    setCurrentStep(0);
    setVisitedSteps(new Set([0]));
    toast.info("Fill the form to add a new case history.");
  };

  const formatYesNo = (value) => (value ? "Yes" : "No");

  const renderReadOnlyRow = (label, value) => (
    <div className="grid grid-cols-[150px_1fr] gap-2 border-b border-gray-100 py-1">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      <span className="text-xs text-gray-800">{value || "-"}</span>
    </div>
  );

  // ─── PDF generation - Downloads Child demographics + medical history/diagram ─────
  const handleGeneratePDF = (history) => {
    try {
      const doc = new jsPDF("p", "pt", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginLeft = 40;
      const marginRight = 40;
      const topMargin = 144;   // 2 inches
      const bottomMargin = 108; // 1.5 inches
      let y = topMargin;

      const demo = history.demographics || {};
      const med = history.medicalHistory || {};

      const addPageLine = (text, x, lineHeight = 16) => {
        if (y > pageHeight - bottomMargin - lineHeight) {
          doc.addPage();
          y = topMargin;
        }
        doc.text(text, x, y);
        y += lineHeight;
      };

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      // Child demographics only
      addPageLine(`Child Name: ${demo.childName || "-"}`, marginLeft);
      addPageLine(`Date of Birth: ${demo.dob || "-"}`, marginLeft);
      addPageLine(`Age: ${calculateAge(demo.dob) || "-"}`, marginLeft);
      addPageLine(`Date of Meeting: ${demo.dateOfJoining || "-"}`, marginLeft);
      addPageLine(`Therapist Name: ${demo.therapistName || "-"}`, marginLeft);
      addPageLine(`Centre: ${demo.centre || "-"}`, marginLeft);

      addPageLine("", marginLeft);
      addPageLine("Father Information", marginLeft);
      addPageLine(`Name: ${demo.fatherName || "-"}`, marginLeft);
      addPageLine(`Phone: ${demo.fatherPhone || "-"}`, marginLeft);
      addPageLine(`Email: ${demo.fatherEmail || "-"}`, marginLeft);
      addPageLine(`Occupation: ${demo.fatherOccupation || "-"}`, marginLeft);
      addPageLine(`Qualifications: ${demo.fatherQualifications || "-"}`, marginLeft);

      addPageLine("", marginLeft);
      addPageLine("Mother Information", marginLeft);
      addPageLine(`Name: ${demo.motherName || "-"}`, marginLeft);
      addPageLine(`Phone: ${demo.motherPhone || "-"}`, marginLeft);
      addPageLine(`Email: ${demo.motherEmail || "-"}`, marginLeft);
      addPageLine(`Occupation: ${demo.motherOccupation || "-"}`, marginLeft);
      addPageLine(`Qualifications: ${demo.motherQualifications || "-"}`, marginLeft);

      if (demo.address) {
        addPageLine("", marginLeft);
        addPageLine(`Address: ${demo.address}`, marginLeft);
      }

      if (med.presentingComplaints) {
        addPageLine("", marginLeft);
        addPageLine("Presenting Complaints:", marginLeft);
        const lines = doc.splitTextToSize(med.presentingComplaints, pageWidth - marginLeft - marginRight);
        lines.forEach((line) => addPageLine(line, marginLeft));
      }

      if (med.pregnancyHistory) {
        addPageLine("", marginLeft);
        addPageLine("Pregnancy History:", marginLeft);
        const lines = doc.splitTextToSize(med.pregnancyHistory, pageWidth - marginLeft - marginRight);
        lines.forEach((line) => addPageLine(line, marginLeft));
      }

      if (med.pedigreeDrawingImage) {
        if (y > pageHeight - bottomMargin - 220) {
          doc.addPage();
          y = topMargin;
        }
        const imageWidth = pageWidth - marginLeft - marginRight;
        const imageHeight = 220;
        doc.addImage(med.pedigreeDrawingImage, "PNG", marginLeft, y, imageWidth, imageHeight);
        y += imageHeight + 10;
      }

      // page numbering (bottom center)
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 40, { align: "center" });
      }

      doc.save(`CaseHistory_${(selectedChild?.name || "Patient").replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF generated! (Child demographics + history)");
    } catch (err) {
      console.error("PDF error:", err);
      toast.error("Failed to generate PDF: " + err.message);
    }
  };

  const handleClearChild = () => {
    setSearchQuery("");
    setSavedHistories([]);
    setReadOnlyHistory(null);
    setIsEditingMode(false);
    setFormData(initialFormData);
    setCurrentStep(0);
    setVisitedSteps(new Set([0]));
  };

  const updateFormData = useCallback((section, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: typeof value === "function" ? value(prev[section]) : value,
    }));
  }, []);

  const goToStep = useCallback((idx) => {
    if (idx >= 0 && idx < STEPS.length) {
      setCurrentStep(idx);
      setVisitedSteps((prev) => new Set([...prev, idx]));
    }
  }, []);

  const handleNext     = useCallback(() => goToStep(currentStep + 1), [currentStep, goToStep]);
  const handlePrevious = useCallback(() => goToStep(currentStep - 1), [currentStep, goToStep]);

  // ─── SAVE — sends everything to backend (creates or updates) ────────────────
  const handleSave = useCallback(async () => {
    if (!selectedChild) {
      toast.error("Please select a child before saving.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        childId: selectedChild._id,
        demographics: {
          childName:          formData.childName,
          dob:                formData.dob,
          dateOfJoining:      formData.dateOfJoining,
          therapistName:      formData.therapistName,
          centre:             formData.centre,
          fatherName:         formData.fatherName,
          fatherPhone:        formData.fatherPhone,
          fatherWhatsApp:     formData.fatherWhatsApp,
          fatherEmail:        formData.fatherEmail,
          fatherOccupation:   formData.fatherOccupation,
          fatherQualifications: formData.fatherQualifications,
          motherName:         formData.motherName,
          motherPhone:        formData.motherPhone,
          motherWhatsApp:     formData.motherWhatsApp,
          motherEmail:        formData.motherEmail,
          motherOccupation:   formData.motherOccupation,
          motherQualifications: formData.motherQualifications,
          address:            formData.address,
          preTherapyVideoRef: formData.preTherapyVideoRef,
          newTherapyAdded:    formData.newTherapyAdded,
          newTherapyDate:     formData.newTherapyDate,
          newTherapistName:   formData.newTherapistName,
          therapyStarted:     formData.therapyStarted,
        },
        documentsChecklist: {
          consultationPaper:   formData.consultationPaper,
          previousMedicalDocs: formData.previousMedicalDocs,
          testReports:         formData.testReports,
          consentForm:         formData.consentForm,
          parentConcerns:      formData.parentConcerns,
          parentConcernsText:  formData.parentConcernsText,
          therapyChange:       formData.therapyChange,
          therapistChange:     formData.therapistChange,
          foodAllergy:         formData.foodAllergy,
        },
        increasingBehaviourPlan: formData.increasingBehaviour,
        decreasingBehaviourPlan: formData.decreasingBehaviour,
        trialExamination:        formData.trialExamination,
        visualShapes:            formData.visualShapes,
        assessmentNotes:         formData.assessmentNotes,
        medicalHistory: {
          presentingComplaints: formData.medicalHistory.presentingComplaints || "",
          referredBy:           formData.medicalHistory.referredBy || "",
          generalHistory:       formData.medicalHistory.generalHistory || "",
          pregnancyHistory:     formData.medicalHistory.pregnancyHistory || "",
          pedigreeDrawingImage: formData.medicalHistory.pedigreeDrawingImage || "",
        },
      };

      if (readOnlyHistory && isEditingMode) {
        // Update existing case history
        await axios.put(`/api/cases/${readOnlyHistory._id}`, payload);
        toast.success("Case history updated successfully!");
      } else if (!readOnlyHistory) {
        // Create new case history
        await axios.post("/api/cases", payload);
        toast.success("Case history created successfully!");
      }
      
      // Refresh history list then show view mode
      await fetchSavedHistories(selectedChild._id);
      setIsEditingMode(false);
      // Do NOT clear child - show the read-only view instead
    } catch (err) {
      console.error(err.response?.data || err.message);
      if (err.response?.status === 409) {
        toast.error("A case history already exists for this child.");
      } else {
        toast.error(err.response?.data?.message || "Failed to save case history.");
      }
    } finally {
      setIsSaving(false);
    }
  }, [formData, selectedChild, readOnlyHistory, isEditingMode]);

  // ─── Keyboard navigation ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.altKey && e.key === "ArrowRight") handleNext();
      if (e.altKey && e.key === "ArrowLeft")  handlePrevious();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNext, handlePrevious]);

  // ─── Scroll to top on step change ─────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const StepComponent = STEPS[currentStep].component;
  const isFirstStep   = currentStep === 0;
  const isLastStep    = currentStep === STEPS.length - 1;

  const getStepStatus = (idx) => {
    if (idx === currentStep)      return "active";
    if (visitedSteps.has(idx))   return "visited";
    return "upcoming";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-5xl mx-auto p-4 sm:p-6" ref={contentRef}>

        {/* ── Header ── */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#ab1c1c]">Case History Wizard</h1>
          <p className="text-sm text-gray-500 mt-1">Complete all 8 steps to record a full case history.</p>
        </div>

        {/* ── Child Selector ── */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Child</label>
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
                placeholder={loadingChildren ? "Loading children..." : "Search child by name..."}
                disabled={loadingChildren}
              />
              {selectedChild && (
                <button
                  onClick={handleClearChild}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  Clear
                </button>
              )}
            </div>

            {showDropdown && filteredChildren.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredChildren.map((child) => (
                  <button
                    key={child._id}
                    onClick={() => handleSelectChild(child)}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{child.name}</p>
                        <p className="text-xs text-gray-500">
                          {child.dob ? calculateAge(child.dob) : "Age unknown"}
                          {child.therapistId?.name ? ` · ${child.therapistId.name}` : ""}
                          {child.centreId?.name ? ` · ${child.centreId.name}` : ""}
                        </p>
                      </div>
                      <span className="text-xs text-[#ab1c1c] font-medium">Select →</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showDropdown && !loadingChildren && filteredChildren.length === 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
                No children found.
              </div>
            )}
          </div>

          {selectedChild && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
              <span>✓</span>
              <span className="font-medium">{selectedChild.name}</span>
              <span className="text-green-600 text-xs">
                {selectedChild.dob ? `· ${calculateAge(selectedChild.dob)}` : ""}
                {selectedChild.therapistId?.name ? ` · ${selectedChild.therapistId.name}` : ""}
                {selectedChild.centreId?.name ? ` · ${selectedChild.centreId.name}` : ""}
              </span>
            </div>
          )}
        </div>

        {selectedChild ? (
          <>
            {isEditingMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-blue-800">✎ Editing Mode</p>
                    <p className="text-xs text-blue-700">You are editing the existing case history. Your changes will update the record.</p>
                  </div>
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel Edit
                  </button>
                </div>
              </div>
            )}

            {/* ── View Mode: Display full 8-page uneditable history ── */}
            {readOnlyHistory && !isEditingMode && (
              <div className="space-y-6">
                {/* Action Header */}
                <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Case History: {selectedChild.name}</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {readOnlyHistory.createdAt ? new Date(readOnlyHistory.createdAt).toLocaleDateString() : "—"} | 
                      Updated: {readOnlyHistory.updatedAt ? new Date(readOnlyHistory.updatedAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditHistory}
                      className="px-4 py-2 bg-[#ab1c1c] text-white rounded-lg hover:bg-[#8e1818] font-medium text-sm"
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => handleGeneratePDF(readOnlyHistory)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-sm"
                    >
                      📄 PDF
                    </button>
                    <button
                      onClick={handleClearChild}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* All 8 Pages Uneditable */}
                <div className="bg-white rounded-lg shadow-md p-6 space-y-8">
                  {STEPS.map((step, idx) => {
                    const StepComp = step.component;
                    return (
                      <div key={idx} className="border-b pb-8 last:border-b-0">
                        <h3 className="text-lg font-bold text-[#ab1c1c] mb-4">{idx + 1}. {step.label}</h3>
                        <StepComp
                          formData={formData}
                          updateFormData={() => {}}
                          selectedChild={selectedChild}
                          readOnly={true}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Form Mode: Show 8-step form (for creating or editing) ── */}
            {!readOnlyHistory || isEditingMode ? (
              <>


                {/* ── Step Indicator ── */}
                <div className="mb-6">
                  {/* Desktop */}
                  <div className="hidden lg:flex items-center justify-between">
                    {STEPS.map((step, index) => {
                      const status = getStepStatus(index);
                      return (
                        <div key={index} className="flex items-center flex-1">
                          <button onClick={() => goToStep(index)} className="flex flex-col items-center group w-full">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                              status === "active"  ? "bg-[#ab1c1c] text-white ring-4 ring-red-200" :
                              status === "visited" ? "bg-[#ab1c1c] text-white opacity-80" :
                              "bg-gray-200 text-gray-500 group-hover:bg-gray-300"}`}>
                              {status === "visited" && index !== currentStep ? "✓" : index + 1}
                            </div>
                            <span className={`mt-2 text-xs text-center leading-tight ${
                              status === "active"  ? "text-[#ab1c1c] font-bold" :
                              status === "visited" ? "text-[#ab1c1c] font-medium" : "text-gray-400"}`}>
                              {step.label}
                            </span>
                          </button>
                          {index < STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 mt-[-20px] ${visitedSteps.has(index + 1) ? "bg-[#ab1c1c]" : "bg-gray-200"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Mobile */}
                  <div className="lg:hidden bg-[#ab1c1c] rounded-lg overflow-x-auto">
                    <div className="flex min-w-max">
                      {STEPS.map((step, index) => (
                        <button key={index} onClick={() => goToStep(index)}
                          className={`flex-1 px-3 py-3 text-xs font-medium transition-colors whitespace-nowrap ${
                            index === currentStep      ? "bg-white text-[#ab1c1c]" :
                            visitedSteps.has(index)   ? "text-white bg-[#8e1818]" :
                            "text-red-200 hover:bg-[#8e1818] hover:text-white"}`}>
                          <span className="font-bold mr-1">{index + 1}.</span>{step.shortLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Step Content ── */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 min-h-[300px]">
                  <StepComponent
                    formData={formData}
                    updateFormData={updateFormData}
                    selectedChild={selectedChild}
                    readOnly={false}
                  />
                </div>

                {/* ── Navigation ── */}
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handleClearChild}
                    className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handlePrevious}
                      disabled={isFirstStep}
                      className={`px-4 sm:px-6 py-2 rounded-lg transition-colors ${
                        isFirstStep ? "border border-gray-200 text-gray-300 cursor-not-allowed" :
                        "border border-[#ab1c1c] text-[#ab1c1c] hover:bg-red-50"}`}
                    >
                      ← Previous
                    </button>
                    {!isLastStep ? (
                      <button onClick={handleNext}
                        className="px-4 sm:px-6 py-2 bg-[#ab1c1c] text-white rounded-lg hover:bg-[#8e1818] transition-colors">
                        Next →
                      </button>
                    ) : (
                      isEditingMode ? (
                        <button 
                          onClick={handleSave} 
                          disabled={isSaving}
                          className={`px-4 sm:px-6 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                            isSaving ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
                          {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                          {isSaving ? "Updating..." : "Update Case History"}
                        </button>
                      ) : (
                        <button 
                          onClick={handleSave} 
                          disabled={isSaving}
                          className={`px-4 sm:px-6 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                            isSaving ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
                          {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                          {isSaving ? "Saving..." : "Create Case History"}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="text-center text-sm text-gray-400">
                  Step {currentStep + 1} of {STEPS.length}
                  <span className="hidden sm:inline ml-3 text-xs">(Alt + ← → to navigate)</span>
                </div>
              </>
            ) : (
              !loadingChildren && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="text-5xl mb-4">👶</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Child to Begin</h3>
                  <p className="text-sm text-gray-500">Search and select a child from the dropdown above.</p>
                  <p className="text-xs text-gray-400 mt-2">
                    No children in the list? Make sure you have added children via the backend seed or API.
                  </p>
                </div>
              )
            )}
          </>
        ) : (
          !loadingChildren && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-5xl mb-4">👶</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Child to Begin</h3>
              <p className="text-sm text-gray-500">Search and select a child from the dropdown above.</p>
              <p className="text-xs text-gray-400 mt-2">
                No children in the list? Make sure you have added children via the backend seed or API.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
