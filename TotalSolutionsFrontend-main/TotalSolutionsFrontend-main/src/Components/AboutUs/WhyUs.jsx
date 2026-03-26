import React from 'react';
import '/src/assets/WhyUs/Timeline.css';
import whyus from "/src/assets/WhyUs/whyus.webp"
import icon from "/src/assets/WhyUs/10.webp";

const data = [
    {
        color: '#fb190f',
        text: 'An organization is led by certified Rehabilitation psychologists.'
    },
    {
        color: '#e059ef',
        text: 'Most of the staff is Rehabilitation Council of India (RCI) certified and trained from renowned institutes.'
    },
    {
        color: '#ff9900',
        text: 'Largest number of trained occupational therapists in twin cities.'
    },
    {
        color: '#045a72',
        text: 'One among three and largest service provider of Tomatis Talks up (listening program) in India with “Tomatis talks-up” and “Forebrain” equipment.'
    },
    {
        color: '#607333',
        text: 'Total solution also provides PASS Based Reading Enhancement Program (PREP). Cognitive Enhancement Training (COGENT), Math Module by Dr J. P Das, Instrumental Enrichment (A cognitive training program conceived by Professor Reuven Feuerstein), Oral Placement Therapy (level 1 and 2) and Audiblox.'
    },
    {
        color: '#f34907',
        text: 'Yearly continuing education programs (CEP) for the staff to update their knowledge.'
    },
    {
        color: '#e059e5',
        text: 'Self-contained training institute for Management of Specific Learning Disorders, ADHD, ADD, Slow Learning, learning problems, Autism Spectrum Disorder, pediatric anxiety disorders, school phobia, school refusal.'
    },
    {
        color: '#ff9900',
        text: 'Institutes which conduct meticulous baseline assessment program by visiting home, school as well as natural play area of the child, as per requirement.'
    },
    {
        color: '#fb190f',
        text: 'Intervention programs are planned in holistic manner by focusing upon, life skills, language processing skills, play behavior and then educational and learning needs.'
    },
    {
        color: '#045a72',
        text: 'Focuses upon multidisciplinary approach by involving occupational, behavior, and speech therapists and monitored by rehabilitation psychologist.'
    },
    {
        color: '#607333',
        text: 'CCTV monitoring of all ongoing therapies by the center heads of the institute.'
    },
    {
        color: '#f34907',
        text: 'Monthly review of goals as per individual therapy plan by the center heads.'
    },
    {
        color: '#e059e5',
        text: 'Quarterly review and meeting by multidisciplinary team along with parents and phone based review with school professionals.'
    },
    {
        color: '#ff9900',
        text: 'Direct training of parents by involving them in all therapy sessions and making them conduct a part of the session under professional supervision.'
    },
    {
        color: '#FF0000',
        text: '30% clientele receives both discounted and free therapies based on their financial income.'
    },
    {
        color: '#004E66',
        text: 'Regular school visits to support teachers for better management of the client in school system.'
    },
    {
        color: '#556B2F',
        text: 'Intermittent shadow support to the client in school for better transfer of learning from center to school situation.'
    },
    {
        color: '#FF4500',
        text: 'More than 600 free workshops in last 10 years in for creating awareness among teachers and parents about learning difficulties among school going children. 280 workshops for parenting to strengthen them for managing behavioral difficulties among children.'
    },
    {
        color: '#DA70D6',
        text: 'Regular free programs for parents attending intervention programs at different branches of total solution, for creating better knowledge about conditions and interventions.'
    },
    {
        color: '#FFA500',
        text: 'Supporting more than 350 children in 8 centers across the city, through scientific research-based practices of Remedial therapy, Cognitive behavior therapy, Applied Behavior Therapy, Behavior modification therapy, occupational therapy, speech therapy.'
    },
    {
        color: '#004E66',
        text: 'All programs of Autism Spectrum Disorder are supervised by Board Certified Assistant Behavior Analyst (BCABA), Mrs. Sophia Pirani.'
    },
    {
        color: '#556B2F',
        text: 'Institute to provide best management for Social Communication Disorder by providing group and individual sessions on Theory of Mind, Social Stories, Teach Me Language Module.'
    },
    {
        color: '#FF4500',
        text: 'High Success rate of management of Learning Disorders, School refusal cases, behavior management of children with ADHD, ADD and development of social skills.'
    },
    {
        color: '#DA70D6',
        text: 'Collaborative and referral practices with medical, paramedical, therapy and educational centers.'
    },
    {
        color: '#FFA500',
        text: 'Friendly environment for therapists so that they can provide best of their potential to children coming for therapies.'
    },
    {
        color: '#004E66',
        text: 'The organization takes staff for two picnics / leisure trips at 50% sponsorship.'
    }
];

const WhyUs = () => {
    return (
        <>
            <div className="font-sans">
                <div className="relative w-full h-96 overflow-hidden">
                    <img
                        src={whyus}
                        alt="Header ADHD Mindmap"
                        className="object-cover w-full h-full"
                    />
                </div>
            </div>
            <div className="timeline-container">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="timeline-item"
                        style={{
                            backgroundColor: item.color,
                            animationDelay: `${index * 0.2}s`
                        }}
                    >
                        <div className="timeline-icon">
                            <img src={icon} alt="icon" />
                        </div>
                        <div className="timeline-text">{item.text}</div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default WhyUs;
