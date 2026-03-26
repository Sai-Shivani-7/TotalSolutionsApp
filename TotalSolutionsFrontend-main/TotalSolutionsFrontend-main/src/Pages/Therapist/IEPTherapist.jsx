import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import handleViewIEP from "../IEPReportPDF";
export default function IEPTherapist() {
  const queryParams = new URLSearchParams(useLocation().search);
  const childId = queryParams.get("childId");
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentGoalData, setCurrentGoalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [performanceInputs, setPerformanceInputs] = useState([]);
  const [currentMonth, setCurrentMonth] = useState("");
  const [doctorFeedback, setDoctorFeedback] = useState("");
  const [therapistFeedback, setTherapistFeedback] = useState("");
  const [iepId, setIepId] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoDescription, setVideoDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [existingVideoUrl, setExistingVideoUrl] = useState(null);
  const [displayVideo, setDisplayVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/doctors/childIEP/${childId}`, {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        });
        setResponses(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [childId]);

  const handleViewUpdate = async(goalWrapper, responseIndex, monthIndex, currIepId) => {
    const goalData = goalWrapper.latest;
    setCurrentGoalData({ ...goalData, responseIndex, monthIndex });
    setCurrentMonth(goalData.month);
    setPerformanceInputs(
      goalData.performance && goalData.performance.length
        ? [...goalData.performance]
        : goalData.goals.map(() => "")
    );
    setTherapistFeedback(goalData.therapistFeedback || "");
    setDoctorFeedback(goalData.doctorFeedback || "");
    setIepId(currIepId);
    setShowModal(true);
    setVideoFile(null);
    setVideoPreview(null);
    setVideoDescription("");
    setExistingVideoUrl(null);
    setDisplayVideo(null);
    setVideoLoading(false);
    if (goalData.childVideo && goalData.childVideo.videoUrl) {
      setVideoLoading(true);
      setExistingVideoUrl(goalData.childVideo.videoUrl);
      try {
        const encodedUrl = encodeURIComponent(goalData.childVideo.videoUrl);
        const videoResponse = await axios.get(`/api/doctors/getIEPVideo/${encodedUrl}`, {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
          responseType: "blob",
        });
        const videoBlob = new Blob([videoResponse.data], { type: videoResponse.headers["content-type"] });
        const url = URL.createObjectURL(videoBlob);
        setDisplayVideo(url);
      } catch (error) {
        console.error("Error fetching video:", error);
        toast.error("Error fetching video", { autoClose: 2000 });
      } finally {
        setVideoLoading(false);
      }
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0]; // Get only the first file
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.warning("Please upload a video file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.warning("Video size should be less than 50MB");
      return;
    }
    setExistingVideoUrl(null); 
  setDisplayVideo(null);
    // Create preview
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      // Capture thumbnail
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      setVideoPreview({
        url: URL.createObjectURL(file),
        thumbnail: canvas.toDataURL("image/jpeg"),
        name: file.name,
        type: file.type,
        size: file.size
      });
      setVideoFile(file);
    };

    video.src = URL.createObjectURL(file);
  };

  const handleRemoveVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview.url);
    setVideoFile(null);
    setVideoPreview(null);
    setVideoDescription("");
  };

  const handleSavePerformance = async () => {
    try {
      let uploadedVideo = null;
      
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("videoDescription", videoDescription);
      formData.append("month", currentMonth);
      formData.append("iepId", iepId);
      formData.append("videoUploadDate", new Date().toISOString());
      formData.append("therapistFeedback", therapistFeedback);
      formData.append("performance", JSON.stringify(performanceInputs));

      // Update performance and feedback
      await axios.put(
        `/api/therapists/updateIEPperformance/${childId}`,
        formData,
        {
          headers: { Authorization: `${sessionStorage.getItem("token")}`, "Content-Type": "multipart/form-data" },
        }
      );

      // Update local state
      setResponses(prevResponses => {
        const updatedResponses = [...prevResponses];
        const { responseIndex, monthIndex } = currentGoalData;

        updatedResponses[responseIndex].monthlyGoals[monthIndex].latest.performance = [
          ...performanceInputs,
        ];
        updatedResponses[responseIndex].monthlyGoals[
          monthIndex
        ].latest.therapistFeedback = therapistFeedback;

        // Add new video if uploaded
        if (uploadedVideo) {
          updatedResponses[responseIndex].monthlyGoals[monthIndex].latest.childVideos = [
            ...(updatedResponses[responseIndex].monthlyGoals[monthIndex].latest.childVideos || []),
            uploadedVideo
          ];
        }

        return updatedResponses;
      });

      toast.success("All data saved successfully!");
      handleModalClose();
      
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Error saving data. Please try again.");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentGoalData(null);
    setPerformanceInputs([]);
    if (videoPreview) URL.revokeObjectURL(videoPreview.url);
    setVideoFile(null);
    setVideoPreview(null);
    setVideoDescription("");
  };

  const handlePerformanceChange = (goalIndex, value) => {
    setPerformanceInputs((prevInputs) => {
      const updatedInputs = [...prevInputs];
      updatedInputs[goalIndex] = value;
      return updatedInputs;
    });
  };

  return (
    <div className="p-4 sm:p-6">
      <ToastContainer />
      <div className="max-w-7xl mx-auto sm:mt-16 md:mt-20 lg:mt-24 xl:mt-28">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#ab1c1c]">
            Individual Education Plan (IEP) {">"}{" "}
            {sessionStorage.getItem("childName")}
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ab1c1c]"></div>
          </div>
        ) : responses.length === 0 ? (
          <h3 className="text-center text-gray-600">No IEPs assigned</h3>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead>
                <tr className="bg-red-100">
                  <th className="p-4 text-left text-[#ab1c1c]">S.No</th>
                  <th className="p-4 text-left text-[#ab1c1c]">Therapy</th>
                  <th className="p-4 text-left text-[#ab1c1c]">Month 1</th>
                  <th className="p-4 text-left text-[#ab1c1c]">Month 2</th>
                  <th className="p-4 text-left text-[#ab1c1c]">Month 3</th>
                  <th className="p-4 text-left text-[#ab1c1c]">Actions</th>
                </tr>
              </thead>
              <tbody>
  {responses
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((response, index) => (
      <tr key={index} className="border-b border-red-200 hover:bg-red-50">
        <td className="p-4 text-gray-700 font-bold">{index + 1}</td>
        <td className="p-4 text-gray-700 font-bold">{response.therapy}</td>
        {response.monthlyGoals.map((goalWrapper, idx) => (
          <td key={idx} className="p-4">
            <div className="flex flex-col space-y-2">
              <span className="text-[#ab1c1c] font-semibold text-lg">
                {goalWrapper.latest.month} {/* Access month from latest */}
              </span>
              <div className="flex space-x-2">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-lg shadow-md transition duration-300"
                  onClick={() =>
                    handleViewUpdate(
                      goalWrapper, // Pass the whole wrapper
                      index,
                      idx,
                      response._id
                    )
                  }
                >
                  View/Update
                </button>
              </div>
            </div>
          </td>
        ))}
        <td className="p-4">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2  px-4 rounded-lg shadow-md transition duration-300"
            onClick={() => handleViewIEP(response)}
          >
            IEP Report
          </button>
        </td>
      </tr>
    ))}
</tbody>
            </table>
          </div>
        )}

        {showModal && currentGoalData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-red-200 flex justify-between items-center">
                <h5 className="text-2xl font-bold text-[#ab1c1c]">
                  Edit Performance - {currentGoalData.month}
                </h5>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 text-2xl border-2 px-3 py-1 rounded border-[#ab1c1c]"
                  onClick={handleModalClose}
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                {/* Long-Term Goal Section */}
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h6 className="text-[#ab1c1c] font-medium mb-2 text-xl">
                    Long-Term Goal
                  </h6>
                  <p className="text-gray-700 text-lg">
                    {currentGoalData.target}
                  </p>
                </div>

                {/* Short-Term Goals Section */}
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h6 className="text-[#ab1c1c] font-medium mb-2 text-xl">
                    Short-Term Goals
                  </h6>
                  {currentGoalData.goals.map((goal, goalIndex) => (
                    <div key={goalIndex} className="mb-4">
                      <p className="text-gray-700 mb-2 mt-2 text-lg">
                        <span className="text-[#ab1c1c] font-medium">
                          {goalIndex + 1}.{" "}
                        </span>
                        {goal}
                      </p>
                      <input
                        type="number"
                        className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                        value={performanceInputs[goalIndex] || ""}
                        onChange={(e) =>
                          handlePerformanceChange(goalIndex, e.target.value)
                        }
                        placeholder="Enter performance (0-100 %)"
                        min="0"
                        max="100"
                        onWheel={(e) => {
                          e.target.blur();
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Video Upload Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h6 className="text-[#ab1c1c] font-medium text-xl">
                      Session Video
                    </h6>
                  </div>

                  {/* Check if video already exists */}
                  {existingVideoUrl ? (
                    <div className="space-y-4">
                      {/* Existing video display */}
                      <div className="p-3 border border-gray-200 rounded-lg bg-white">
                        <div className="flex items-start space-x-4">
                          {/* Video player for existing video */}
                          <div className="flex-shrink-0 relative w-full max-w-md mx-auto">
                            {videoLoading ? (
                              <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#ab1c1c]"></div>
                              </div>
                            ) : (
                              <video
                                controls
                                className="w-full h-auto rounded object-cover border"
                              >
                                <source src={displayVideo} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            )}
                          </div>

                          {/* Video info */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <p className="text-sm  text-gray-900">
                              <span className="font-semibold">Uploaded on: </span>{new Date(currentGoalData.childVideo.videoUploadDate).toLocaleDateString()}
                            </p>
                            <div className="text-sm text-gray-900">

                              <p><span className="font-semibold">Video Description: </span>{currentGoalData.childVideo.videoDescription || "No description provided"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Upload new video button with warning */}
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              Uploading a new video will replace the existing one.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Upload new video button */}
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload new video</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              MP4, MOV, AVI (MAX. 50MB)
                            </p>
                          </div>
                          <input
                            id="video-upload"
                            type="file"
                            className="hidden"
                            accept="video/*"
                            onChange={handleVideoUpload}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    /* Original upload UI when no video exists */
                    !videoPreview ? (
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              MP4, MOV, AVI (MAX. 50MB)
                            </p>
                          </div>
                          <input
                            id="video-upload"
                            type="file"
                            className="hidden"
                            accept="video/*"
                            onChange={handleVideoUpload}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="p-3 border border-gray-200 rounded-lg bg-white">
                        <div className="flex items-start space-x-4">
                          {/* Thumbnail preview */}
                          <div className="flex-shrink-0 relative">
                            <img
                              src={videoPreview.thumbnail}
                              alt="Video thumbnail"
                              className="h-20 w-32 rounded object-cover border"
                            />
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                              {formatFileSize(videoPreview.size)}
                            </div>
                          </div>

                          {/* Video info */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {videoPreview.name}
                            </p>

                            {/* Description input */}
                            <input
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              value={videoDescription}
                              onChange={(e) => setVideoDescription(e.target.value)}
                              placeholder="Enter video description"
                            />
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={handleRemoveVideo}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Therapist Feedback Section */}
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h6 className="text-[#ab1c1c] font-medium mb-2 text-xl">
                    Therapist Feedback
                  </h6>
                  <textarea
                    className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                    value={therapistFeedback}
                    onChange={(e) => setTherapistFeedback(e.target.value)}
                    placeholder="Enter feedback based on the child performance"
                    rows="3"
                  />
                </div>

                {/* Doctor's Feedback Section */}
                {doctorFeedback && (
                  <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <h6 className="text-[#ab1c1c] font-medium mb-2 text-xl">
                      Doctor's Feedback
                    </h6>
                    <p className="text-gray-700 text-lg">{doctorFeedback}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="p-6 border-t border-red-200">
                  <button
                    type="button"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                    onClick={handleSavePerformance}
                    disabled={isUploading}
                  >
                    {isUploading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ml-2"
                    onClick={handleModalClose}
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}