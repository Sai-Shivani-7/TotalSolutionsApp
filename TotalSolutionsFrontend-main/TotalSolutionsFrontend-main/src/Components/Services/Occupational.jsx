import React, { useState } from "react";
import heroImage from "../../assets/Services/Occupational/heroImage3.webp";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const OccupationalTherapy = () => {
  const [expandedFrames, setExpandedFrames] = useState({
    sensoryIntegration: false,
    neuroDevelopmental: false,
    teachingLearning: false,
  });

  const toggleFrame = (frame) => {
    setExpandedFrames((prev) => ({
      ...prev,
      [frame]: !prev[frame],
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        <img
          src={heroImage}
          alt="Occupational Therapy Services"
          className="w-full h-auto object-cover"
        />
      </div>

      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-12 text-center">
          Occupational Therapy
        </h1>

        <div className="mb-8 p-4 border border-black rounded-lg">
          <div
            className="p-4 rounded-lg cursor-pointer flex justify-between items-center"
            onClick={() => toggleFrame("sensoryIntegration")}
          >
            <h2 className="text-2xl font-bold text-gray-800">
              A Frame of Reference for Sensory Integration
            </h2>
            {expandedFrames.sensoryIntegration ? (
              <ChevronDownIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <ChevronRightIcon className="h-6 w-6 text-gray-700" />
            )}
          </div>

          {expandedFrames.sensoryIntegration && (
            <div className="mt-4 space-y-6 pl-4">
              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Theoretical Base
                </h3>
                <p className="text-gray-700">
                  Sensory information provides an important foundation for
                  learning and behavior. Sensory integration is a developmental
                  process. Successful integration and organization of sensory
                  information results in and is further developed by adaptive
                  responses. The 'just right challenge' provides the milieu for
                  sensory integration to occur. Children have an innate drive to
                  seek meaningful experiences from their environment. Sensory
                  integration promotes neuroplasticity. Sensory integration is a
                  foundation for participation.
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Application to practice
                </h3>
                <ul className="space-y-2">
                  {[
                    "Setting goals for intervention",
                    "Considerations for intervention",
                    "The physical environment of intervention",
                    "Therapeutic interventions related to modulation",
                    "Therapeutic interventions related to sensory discrimination",
                    "Therapeutic interventions related to bilateral integration and sequencing",
                    "Therapeutic interventions related to promoting praxis",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Key sensory integrative abilities (Sensory modulation)
                </h3>
                <ul className="space-y-2">
                  {[
                    "Sensory discrimination",
                    "Postural-ocular control",
                    "Praxis",
                    "Bilateral integration and sequencing",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Outcomes of adequate sensory integration
                </h3>
                <ul className="space-y-2">
                  {[
                    "Sensory discrimination",
                    "Postural-ocular control",
                    "Praxis",
                    "Bilateral integration and sequencing",
                    "Modulation, discrimination, and integration of sensory information",
                    "Self-Regulation",
                    "Postural control and bilateral motor coordination",
                    "Praxis",
                    "Organize behavior needed for developmentally appropriate tasks and activities",
                    "Self-esteem",
                    "Participation in self-care, leisure, and academic and social activities",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <h4 className="font-medium text-gray-800">
                    Populations for whom this frame of reference is used
                  </h4>
                  <p className="text-gray-700">
                    Children with sensory processing disorders, autism spectrum
                    disorder, and other developmental conditions.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Guide to evaluation
                </h3>
                <ul className="space-y-2">
                  {[
                    "Record review",
                    "Identifying patterns of dysfunction",
                    "Communication with parents, care providers, and teachers",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Function - Dysfunction
                </h3>
                <ul className="space-y-2">
                  {[
                    "Sensory modulation abilities",
                    "Sensory discrimination",
                    "Dyspraxia",
                    "Bilateral integration and sequencing dysfunction",
                    "Modulation, discrimination, and integration of sensory information",
                    "Poor visual perception and visual motor integration (visuodyspraxia)",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

 
        <div className="mb-8 p-4 border border-black rounded-lg">
          <div
            className="p-4 rounded-lg cursor-pointer flex justify-between items-center"
            onClick={() => toggleFrame("neuroDevelopmental")}
          >
            <h2 className="text-2xl font-bold text-gray-800">
              A Frame of Reference for Neuro-Developmental Treatment
            </h2>
            {expandedFrames.neuroDevelopmental ? (
              <ChevronDownIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <ChevronRightIcon className="h-6 w-6 text-gray-700" />
            )}
          </div>

          {expandedFrames.neuroDevelopmental && (
            <div className="mt-4 space-y-6 pl-4">
 
              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Theoretical Base
                </h3>
                <ul className="space-y-2">
                  {[
                    "Development of reach and grasp",
                    "Kinesiological and biomechanical concepts",
                    "Movement dysfunction",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
 
              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Function - Dysfunction
                </h3>
                <ul className="space-y-2">
                  {[
                    "Range of movement and dissociation of movement",
                    "Alignment and patterns of weight bearing",
                    "Muscle tone",
                    "Postural tone",
                    "Balance and postural control",
                    "Coordination",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
 
              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Guide to evaluation
                </h3>
                <ul className="space-y-2">
                  {[
                    "Overall assessment of functional skills",
                    "Evaluation of posture and movement",
                    "Handling techniques",
                    "Qualities of touch",
                    "Preparation, facilitation, and inhibition",
                    "Learning the process of therapeutic handling",
                    "Integration of neuro-developmental treatment into activity",
                    "Positioning and adaptive equipment",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8 p-4 border border-black rounded-lg">
          <div
            className="p-4 rounded-lg cursor-pointer flex justify-between items-center"
            onClick={() => toggleFrame("teachingLearning")}
          >
            <h2 className="text-2xl font-bold text-gray-800">
              A Frame of Reference to Enhance Teaching - Learning
            </h2>
            {expandedFrames.teachingLearning ? (
              <ChevronDownIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <ChevronRightIcon className="h-6 w-6 text-gray-700" />
            )}
          </div>

          {expandedFrames.teachingLearning && (
            <div className="mt-4 space-y-6 pl-4">
              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Theoretical Base
                </h3>
                <ul className="space-y-2">
                  {[
                    "The four-quadrant model of facilitated learning",
                    "Task specification",
                    "Decision making",
                    "Key points",
                    "Autonomy",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Guide to evaluation
                </h3>
                <ul className="space-y-2">
                  {[
                    "Does the child know what to do and how to do it?",
                    "Is the child making astute decisions about their performance?",
                    "Is the child aware of errors?",
                    "Is the child recalling the steps of the task and other key features of performance?",
                    "Are there any signs of self-prompting?",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Function - Dysfunction
                </h3>
                <ul className="space-y-2">
                  {[
                    "Mental imagery to complete a task",
                    "Self-instruction to complete a task",
                    "Successfully uses self-monitoring to complete a task",
                    "Successfully uses self-instruction to complete a task",
                    "Successfully problem solves to complete a task",
                    "Successfully uses automaticity to complete a task",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Application to practice
                </h3>
                <ul className="space-y-2">
                  {["Task"].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <div className="mb-8 p-4 border border-black rounded-lg">
          <div
            className="p-4 rounded-lg cursor-pointer flex justify-between items-center"
            onClick={() => toggleFrame("childhoodOccupations")}
          >
            <h2 className="text-2xl font-bold text-gray-800">
              A Frame of Reference to Enhance Childhood Occupations
            </h2>
            {expandedFrames.childhoodOccupations ? (
              <ChevronDownIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <ChevronRightIcon className="h-6 w-6 text-gray-700" />
            )}
          </div>

          {expandedFrames.childhoodOccupations && (
            <div className="mt-4 space-y-6 pl-4">
              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Theoretical Base
                </h3>
                <ul className="space-y-2">
                  {[
                    "Synthesis of child, occupational, performance, and environment - in time",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Application to practice
                </h3>
                <ul className="space-y-2">
                  {[
                    "The child–environment–occupation fit",
                    "Work and productivity",
                    "Play and leisure",
                    "Activities of daily living",
                    "Rest and sleep",
                    "Occupational patterns",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Function - Dysfunction
                </h3>
                <ul className="space-y-2">
                  {[
                    "Work and productivity",
                    "Play and leisure",
                    "Activities of daily living and self-care",
                    "Rest and sleep",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Guide to evaluation
                </h3>
                <ul className="space-y-2">
                  {[
                    "Evaluating occupational performance in time",
                    "Evaluating the environment",
                    "Evaluation synthesis",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <div className="mb-8 p-4 border border-black rounded-lg">
          <div
            className="p-4 rounded-lg cursor-pointer flex justify-between items-center"
            onClick={() => toggleFrame("socialParticipation")}
          >
            <h2 className="text-2xl font-bold text-gray-800">
              A Frame of Reference to Enhance Social Participation
            </h2>
            {expandedFrames.socialParticipation ? (
              <ChevronDownIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <ChevronRightIcon className="h-6 w-6 text-gray-700" />
            )}
          </div>

          {expandedFrames.socialParticipation && (
            <div className="mt-4 space-y-6 pl-4">
              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Theoretical Base
                </h3>
                <ul className="space-y-2">
                  {[
                    "Interaction between caregivers and children",
                    "Interaction between caregivers and children with disabilities",
                    "Developing habits and routines",
                    "Developing habits and routines for children with disabilities",
                    "Social participation with peers",
                    "Children with disabilities: social participation with peers",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Function - Dysfunction
                </h3>
                <ul className="space-y-2">
                  {[
                    "Temperament",
                    "Habits and routines",
                    "Environment",
                    "Peer Interaction",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Guide to evaluation
                </h3>
                <ul className="space-y-2">
                  {[
                    "Assessing caregivers' needs for support in increasing children's social participation",
                    "Assessment of children's social participation",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Application to practice
                </h3>
                <ul className="space-y-2">
                  {[
                    "Consulting with caregivers",
                    "Role modeling",
                    "Activity-based intervention when parents are ill",
                    "Promoting social participation in classroom settings",
                    "Promoting effortful control in inclusive settings",
                    "Occupation-based groups to increase children's social participation with peers",
                    "Structuring an activity group",
                    "Choosing activities",
                    "Dealing with activity group process",
                    "Grading the amount of frustration",
                    "Aggressive behavior",
                    "Group resistance",
                    "Culture, beliefs, and values",
                    "Termination",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <div className="mb-8 p-4 border border-black rounded-lg">
          <div
            className="p-4 rounded-lg cursor-pointer flex justify-between items-center"
            onClick={() => toggleFrame("visualPerception")}
          >
            <h2 className="text-2xl font-bold text-gray-800">
              A Frame of Reference for Visual Perception
            </h2>
            {expandedFrames.visualPerception ? (
              <ChevronDownIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <ChevronRightIcon className="h-6 w-6 text-gray-700" />
            )}
          </div>

          {expandedFrames.visualPerception && (
            <div className="mt-4 space-y-6 pl-4">
              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Theoretical Base
                </h3>
                <ul className="space-y-2">
                  {[
                    "Visual perception is a developmental process",
                    "Visual perceptual processing is learned and increases with development, experience, and practice, and through stimulation from the environment",
                    "Children can learn by interacting with and observing adults and other children",
                    "Learning does not necessarily follow a developmental sequence. A deficit in one area does not predict a deficit or problem in another area",
                    "Difficulty with visual perception can interfere with daily occupations including the development of reading and writing skills",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Function - Dysfunction
                </h3>
                <ul className="space-y-2">
                  {[
                    "Visual reception skills",
                    "Visual attention",
                    "Visual memory",
                    "Visual discrimination",
                    "Visual spatial",
                    "Visual motor integration",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Guide to evaluation
                </h3>
                <ul className="space-y-2">
                  {[
                    "Visual spatial assessment",
                    "Visual motor integration assessments",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Application to practice
                </h3>
                <ul className="space-y-2">
                  {[
                    "Input: environmental adaptations",
                    "Processing: remediation of visual reception",
                    "Processing: remediation of visual cognition",
                    "Processing: visual reception strategies",
                    "Processing: visual cognition: strategies",
                    "Processing: environmental adaptations for visual reception",
                    "Visual cognition: environmental adaptations",
                    "Output: remediation of performance skills",
                    "Output: strategies for performance",
                    "Output: strategies for occupation",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8 p-4 border border-black rounded-lg">
          <div
            className="p-4 rounded-lg cursor-pointer flex justify-between items-center"
            onClick={() => toggleFrame("motorSkillAcquisition")}
          >
            <h2 className="text-2xl font-bold text-gray-800">
              A Frame of Reference for Motor Skill Acquisition
            </h2>
            {expandedFrames.motorSkillAcquisition ? (
              <ChevronDownIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <ChevronRightIcon className="h-6 w-6 text-gray-700" />
            )}
          </div>

          {expandedFrames.motorSkillAcquisition && (
            <div className="mt-4 space-y-6 pl-4">
              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Theoretical Base
                </h3>
                <ul className="space-y-2">
                  {[
                    "Motor control, motor learning, and motor development",
                    "Dynamic systems",
                    "Learning",
                    "Concepts",
                    "Child-task-environment match",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Function - Dysfunction
                </h3>
                <ul className="space-y-2">
                  {[
                    "Motor task",
                    "Child's environment",
                    "Task requirements",
                    "Child-task-environment",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Guide to evaluation
                </h3>
                <ul className="space-y-2">
                  {["Child", "Task", "Environment"].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Application to practice
                </h3>
                <ul className="space-y-2">
                  {[
                    "Occupational therapy evaluation",
                    "Observation of task performance",
                    "Art project",
                    "Goals and objectives",
                    "Intervention",
                    "Physical education",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <div className="mb-8 p-4 border border-black rounded-lg">
          <div
            className="p-4 rounded-lg cursor-pointer flex justify-between items-center"
            onClick={() => toggleFrame("handwritingSkills")}
          >
            <h2 className="text-2xl font-bold text-gray-800">
              A Frame of Reference for Development of Handwriting Skills
            </h2>
            {expandedFrames.handwritingSkills ? (
              <ChevronDownIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <ChevronRightIcon className="h-6 w-6 text-gray-700" />
            )}
          </div>

          {expandedFrames.handwritingSkills && (
            <div className="mt-4 space-y-6 pl-4">
              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Theoretical Base
                </h3>
                <ul className="space-y-2">
                  {[
                    "Multiple intelligences",
                    "Discrete motor skill learning",
                    "Optimal challenge point",
                    "Teaching writing",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Function - Dysfunction
                </h3>
                <ul className="space-y-2">
                  {[
                    "Writing posture",
                    "Components",
                    "Use of writing tools",
                    "Grasp",
                    "Writing legibility",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Guide to evaluation
                </h3>
                <ul className="space-y-2">
                  {[
                    "Handwriting legibility",
                    "Speed",
                    "Tool use",
                    "Functional visual skills",
                    "Sensory processing",
                    "Attentional issues",
                    "Learning issues",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">➔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Application to practice
                </h3>
                <ul className="space-y-2">
                  {["Peer Support", "Working in a first-grade classroom"].map(
                    (item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">➔</span>
                        <span>{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OccupationalTherapy;
