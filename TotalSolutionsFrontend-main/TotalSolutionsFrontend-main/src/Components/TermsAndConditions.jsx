import React from "react";

const personalInfoList = [
    "Patient/Caregiver/Doctor/Health Care Professional Name,",
    "Birth date/age,",
    "Gender",
    "Address (including country and pin/postal code),",
    "Phone number/mobile number,",
    "Email address,",
    "Physical, physiological and mental health condition, provided by You and/or your Health Care Professional,",
    "Personal medical records and history,",
    "Valid financial information at time of purchase of product/service and/or online payment,",
    "Login ID and password,",
    "User details as provided at the time of registration or thereafter,",
    "Records of interaction with TSRS representatives,",
    "Your usage details such as time, frequency, duration and pattern of use, features used and the amount of storage used,",
    "Master and transaction data and other data stored in Your user account,",
    "Any other information that is willingly shared by You (collectively referred to as “Personal Information”).",
    "Biometrics data",
    "Genetic Data",
    "Transgender Status",
    "Intersex Status",
    "Caste or Tribe",
    "Religious or political belief or affiliation",
    "Sexual orientation",
]


const howwecollect = [
    "When You fill the patient registration form,",
    "When You provide details to a TSRS Professional or TSRS representative,",
    "When You register on Our Website,",
    "When You provide Your Personal Information to Us during course of receiving services,",
    "When You use the features on Our Website,",
    "When you provide access to any other website.",
]

const useofpersonalinfo = [
    "To provide effective Services",
    "To operate and improve the Website and/or our Services;,",
    "To perform studies, research and analysis for improving Our information, analysis, services and technologies; and ensuring that the content displayed are customized to Your interests and preferences;",
    "To contact You via phone, SMS, WhatsApp or email for appointments, technical issues, payment reminders, deals and offers and other announcements;",
    "To send promotional mailings from Us or any of Our channel partners via SMS, WhatsApp, email;",
    "To advertise products and services of TSRS;",
    "To transfer information about You if we are acquired by or merged with another company;",
    "To share with our business partners for provision of specific services you have ordered so as to enable them to provide effective services to You;",
    "To administer or otherwise carry out Our obligations in relation to any agreement You have with us;",
    "To build your profile on the Website;",
    "To respond to subpoenas, court orders, or legal process, or to establish or exercise Our legal rights or defend against legal claims;",
    "To investigate, prevent, or take action regarding illegal activities, suspected fraud, violations of our Terms of Use, breach of Our agreement with you or as otherwise required by law,",
    "To aggregate Personal Information for research, statistical analysis and business intelligence purposes, and to sell or otherwise transfer such research, statistical or intelligence data in an aggregated or non-personally identifiable form to third parties and affiliates, (referred to as “Purpose(s)”)"
]

const sharing = [
    " Once you have freely consented to share your Personal Information with us, You authorize us to exchange, transfer, share, part with all or any of Your Personal Information, across borders and from Your country to any other countries across the world with the Cloud Service Provider and Our affiliates / agents / third party service providers / partners / banks and financial institutions or any other persons, for the Purposes specified under this Policy or as may be required by applicable law.",
    "You acknowledge that some countries where we may transfer Your Personal Information may not have data protection laws that are as stringent as the laws of Your own country. You acknowledge that it is adequate that when TSRS transfers Your Personal Information to any other entity within or outside Your country of residence, TSRS will place contractual obligations on the transferee which will oblige the transferee to adhere to the provisions of this Privacy Policy."
]

const security = [
    "The security of your Personal Information is important to us. We have adopted reasonable security practices and procedures including role-based access and need to know basis, password protection, encryption etc. to ensure that the Personal Information collected is secure. We restrict access to your Personal Information to Our and Our affiliates’ employees, agents, third party service providers, partners, and agencies on a need to know basis and in relation to the Purposes as specified above in this Policy.",
    "While We will endeavour to take all reasonable and appropriate steps to keep secure any information which We hold about You and prevent unauthorized access, you acknowledge that the internet is not 100% secure and that We cannot provide any absolute assurance regarding the security of Your Personal Information. We will not be liable in any way in relation to any breach of security or unintended loss or disclosure of information caused by Us in relation to your Personal Information."
]

const thirdparty = [
    "During Your interactions with Us, it may happen that We provide/include reference to third parties or fiduciaries, and/or links and hyperlinks of third party websites. It may also happen that you include links and hyperlinks of third party websites. The reference of such third parties or listing of such third party external sites (by You or by Us) does not imply endorsement of such party or site by TSRS. Such third parties and third party sites are governed by their own terms and conditions. We do not make any representations regarding the availability and performance of any of the third parties or third party sites. We are not responsible for the content, terms of use, privacy policies and practices of such third party websites.",
    "Do-not-track requests There is no standard for how online service should respond to “Do Not Track” signals or other mechanisms that may allow you to opt out of the collection of information across networks of websites and online services. Therefore, we do not honour “Do Not Track” signals. As standards develop, we will revisit this issue and update this notice if our practices change."
]

export default function TermsAndConditions() {
    return (
        <div className="max-w-4xl mx-auto p-6 font-sans text-[#001F3F]">
            <section className="mb-10">
                <h2 className="text-xl md:text-2xl font-bold text-center mb-4">
                    I. TERMS & CONDITIONS
                    <span className="block w-24 h-1 bg-red-500 mx-auto mt-1"></span>
                </h2>
                <p className="text-sm md:text-base mb-4">
                    Please read and accept this privacy policy carefully before accessing or using the website. By accessing or using the website, you agree to be bound by the terms & conditions mentioned as well as all terms incorporated by reference.
                </p>
                <p className="text-sm md:text-base mb-4">
                    This document ("Terms") constitutes an electronic record as determined by the Information Technology Act, 2000 and the rules that administer it, as well as the amended provisions in several statutes pertaining to electronic records, as amended from time to time by the Information Technology Act, 2000.
                </p>
                <ol className="list-decimal pl-6 space-y-2 text-sm md:text-base">
                    <li>
                        The following privacy statement ("Privacy Statement") applies to website XXX, operated by Total Solution Rehabilitation Society, a firm registered under the Telangana Societies Registration Act 2001... (truncated for brevity).
                    </li>
                    <li>
                        The Website is a digital platform for the services of consultations and assessments provided by registered body-Total Solution Rehabilitation Society.
                    </li>
                    <li>
                        Individuals or entities that have agreed to become users of the Website in accordance with the procedure... may access the Services, the term shall also include visitors...
                    </li>
                    <li>
                        As much as we do our best to provide security... the inherent insecurities of the Internet mean that we cannot guarantee or warrant the complete security of your personal information.
                    </li>
                </ol>
                <ul className="list-disc pl-6 mt-4 text-sm md:text-base space-y-1">
                    <li>Our Liability</li>
                    <li>Company Information</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-xl md:text-2xl font-bold text-center mb-4">
                    II. PRIVACY POLICY
                    <span className="block w-24 h-1 bg-red-500 mx-auto mt-1"></span>
                </h2>
                <p className="text-sm md:text-base mb-4">
                    Total solutions Rehabilitation society. (TSRS) is committed to respecting the privacy of every person who shares information or data with TSRS. Your privacy protection is important to us and we strive to take due care and protection of the information we receive from you, the User.
                </p>
                <p className="text-sm md:text-base mb-4">
                    This document ("Terms") constitutes an electronic record as determined by the Information Technology Act, 2000...
                </p>
                <ul className="list-disc pl-6 text-sm md:text-base space-y-1">
                    <li>The Information Technology Act, 2000 – Section 43A.</li>
                    <li>
                        The Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Information) Rules, 2011.
                    </li>
                </ul>
                <p className="text-sm md:text-base mt-4">
                    This Privacy Policy ("Privacy Policy") applies to the collection, storage, processing, disclosure and transfer of your Personal Information...
                </p>
                <p className="text-sm md:text-base mt-2">
                    The terms 'You' or 'Your' refer to you as the User (registered or unregistered) of the Website...
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-left mb-2 text-orange-600">
                    1. ACCESS
                </h2>
                <p className="text-sm md:text-base">
                    We collect Your Personal Information directly from You, through Our Website. This Personal Information, for instance, would relate to the type of device You are using, the time that You have logged on to Our Website, Your IP address and other Personal Information as listed in Clause 5 below.

                    You may access the Personal Information shared by You with Us, in the manner given below. You can further choose to share additional Personal Information with Us and you can modify your personal data, through website itself or by writing to Us on tsrsofficial@tsrs.in

                    We keep in mind that the Personal Information shared by You is accessible to You. You can write to Us at the email id specified in Clause 15.
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-left mb-2 text-orange-600 mt-2">
                    2. CONSENT
                </h2>
                <p className="text-sm md:text-base">
                    By choosing the Opt-In option on the Website and thereafter, by providing Us Your personal information or availing services of TSRS or by making use of the facilities provided by the Website, it is agreed by You that You have, freely consented to the collection, storage, processing, disclosure and transfer of Your Personal Information in accordance with the provisions of this Privacy Policy and any amendments thereof.

                    You acknowledge that You have provided Your Personal Information out of your free will and after understanding how it will be used. You also consent that the collection, storage, processing, disclosure and transfer of any Personal and privacy Information shall not cause any wrongful loss to You, if it is done in accordance with the provisions of this Privacy Policy. However, we shall not be liable for any loss that may happen to you owing to the provision of wrongful Personal Information by You.

                    We will share personal information outside of TSRS only when we have your consent. We will ask for your explicit consent to share any sensitive personal information.
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-left mb-2 text-orange-600 mt-2">
                    3. CONTROL OVER YOUR PERSONAL INFORMATION
                </h2>
                <p className="text-sm md:text-base">
                    You have the right to withdraw Your consent at any point, provided such withdrawal of the consent is intimated to us in writing through an email at tsrsofficial@tsrs.in requesting the same. If You wish to rectify the Personal Information that we may have collected to offer You personalized services and offers, as per Clause 12 of this Policy, you may write to Us, as mentioned under Clause 15.1 of this Policy, citing the reason for such rectification of Personal Information.

                    Once You withdraw Your Consent to share the Personal Information collected by Us, We shall have the option not to fulfil the purposes for which the said Personal Information was sought and We may restrict you from using our Services or the Website.
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-left mb-2 text-orange-600 mt-2">
                    4. CHANGES TO THE PRIVACY POLICY
                </h2>
                <p className="text-sm md:text-base">
                    We reserve the right to change this Privacy Policy from time to time. We will not reduce your rights under this Privacy Policy without your explicit consent. We always indicate the date when the last changes were published. If changes are significant, we’ll provide a more prominent notice (including, for certain services, email notification of Privacy Policy changes).
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-left mb-2 text-orange-600 mt-2">
                    5. PERSONAL INFORMATION COLLECTED
                </h2>
                <p className="text-sm md:text-base">
                    The kinds of information that We collect about You include but are not limited to the following:

                    {personalInfoList.map((item, index) => (
                        <li key={index} className="list-disc pl-6 mt-2">
                            {item}
                        </li>
                    ))}
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-left mb-2 text-orange-600 mt-2">
                    6. HOW WE COLLECT PERSONAL INFORMATION
                </h2>
                <p className="text-sm md:text-base">
                    The methods by which we collect your Personal Information include but are not limited to the following:

                    {howwecollect.map((item, index) => (
                        <li key={index} className="list-disc pl-6 mt-2">
                            {item}
                        </li>
                    ))}
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-left mb-2 text-orange-600 mt-2">
                    7. USE OF PERSONAL INFORMATION
                </h2>
                <p className="text-sm md:text-base">
                    Your Personal Information may be used or processed for various purposes including but not limited to the following:

                    {useofpersonalinfo.map((item, index) => (
                        <li key={index} className="list-disc pl-6 mt-2">
                            {item}
                        </li>
                    ))}
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-left mb-2 text-orange-600 mt-2">
                    8. SHARING AND TRANSFERRING OF PERSONAL INFORMATION
                </h2>
                <p className="text-sm md:text-base">

                    {sharing.map((item, index) => (
                        <li key={index} className="list-disc pl-6 mt-2">
                            {item}
                        </li>
                    ))}
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-left mb-2 text-orange-600 mt-2">
                    9. SECURITY
                </h2>
                <p className="text-sm md:text-base">

                    {security.map((item, index) => (
                        <li key={index} className="list-disc pl-6 mt-2">
                            {item}
                        </li>
                    ))}
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-left mb-2 text-orange-600 mt-2">
                    10. THIRD PARTY REFERENCES AND LINKS
                </h2>
                <p className="text-sm md:text-base">

                    {thirdparty.map((item, index) => (
                        <li key={index} className="list-disc pl-6 mt-2">
                            {item}
                        </li>
                    ))}
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-left mb-2 text-orange-600 mt-2">
                    11. RECTIFICATION/CORRECTION OF PERSONAL INFORMATION
                </h2>
                <p className="text-sm md:text-base">
                    If You need to update or correct your Personal Information, you may update/edit the same directly on the website and also send corrections to us at tsrsofficial@tsrs.inwe will take all reasonable efforts to incorporate the changes within a reasonable period.
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-left mb-2 text-orange-600 mt-2">
                    12. COMPLIANCE WITH LAWS
                </h2>
                <p className="text-sm md:text-base">
                    You are not allowed to use the services of the Website if any of the terms of this Privacy Policy are not in accordance with the applicable laws of your country.
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-left mb-2 text-orange-600 mt-2">
                    13. TERM OF STORAGE OF PERSONAL INFORMATION
                </h2>
                <p className="text-sm md:text-base">
                    TSRS shall store Your Personal Information at least for a period of three years from the last date of use of the Services or Website or for such period as may be required by law..
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-left mb-2 text-orange-600 mt-2">
                    14. GRIEVANCE OFFICER
                </h2>
                <p className="text-sm md:text-base">
                    We have appointed a Grievance Officer to address any concerns or grievances that You may have regarding the processing of Your Personal Information. If you have any such grievances, please write to our Grievance Officer at XXXXX and Our officer will attempt to resolve Your issues in a timely manner.
                </p>
            </section>
            <div className="max-w-6xl mx-auto px-6 py-10 font-sans text-[#001F3F]">
                <section className="mb-12">
                    <h2 className="text-xl md:text-2xl font-bold text-center mb-4">
                        III. REFUND/CANCELLATION POLICY
                        <span className="block w-24 h-1 bg-red-500 mx-auto mt-1"></span>
                    </h2>

                    <div className="text-sm md:text-base">
                        <p className="text-red-600 font-semibold mb-2">For online payments-</p>
                        <ol className="list-decimal pl-5 space-y-1 mb-4">
                            <li>If the cancellation is done on the same day - Full refund will be made.</li>
                            <li>For cancellation 3 days before a refund of 50% will be made.</li>
                            <li>For cancellation of 0-3 days no refund will be made.</li>
                        </ol>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                A charge of 200 rs will be collected for all kinds of appointment which is non-refundable for consultations and 500rs
                                non-refundable for assessments.
                            </li>
                            <li>
                                If a cancellation occurs from TSRS or the appointed doctor, complete amount will be refunded back to the source.
                            </li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl md:text-2xl font-bold text-center mb-4">
                        IV. PRICING & SERVICE INFORMATION
                        <span className="block w-24 h-1 bg-red-500 mx-auto mt-1"></span>
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 text-sm md:text-base">
                            <thead>
                                <tr className="bg-gray-600 text-white">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Service</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Approx time</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Approx time</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Provisions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-white">
                                    <td className="border px-4 py-2">Consultations</td>
                                    <td className="border px-4 py-2">500.00</td>
                                    <td className="border px-4 py-2">30mins</td>
                                    <td className="border px-4 py-2"></td>
                                    <td className="border px-4 py-2">Prescription and clinical suggestions</td>
                                </tr>

                                <tr className="bg-gray-100 font-semibold">
                                    <td colSpan="5" className="px-4 py-2">IQ Assessments</td>
                                </tr>

                                {[
                                    { service: "MISIC", price: "5,000.00", time: "60-120 mins" },
                                    { service: "BKT", price: "3,000.00", time: "60-90 mins" },
                                    { service: "BBIT", price: "7,500.00", time: "90-120 mins" },
                                    { service: "WISC&WIAT", price: "12,000.00", time: "240 mins" },
                                    {
                                        service: "Home Visit- DST/VSMS/CARS",
                                        price: "5,000.00",
                                        time: "60 mins",
                                        note: "Professional will visit the client’s home to observe the child in his/her natural habitat",
                                    },
                                    { service: "BELE", price: "", time: "" },
                                ].map((item, i) => (
                                    <tr key={i} className="bg-white">
                                        <td className="border px-4 py-2">{item.service}</td>
                                        <td className="border px-4 py-2">{item.price}</td>
                                        <td className="border px-4 py-2">{item.time}</td>
                                        <td className="border px-4 py-2">{item.note || ""}</td>
                                        <td className="border px-4 py-2">Detailed report</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
