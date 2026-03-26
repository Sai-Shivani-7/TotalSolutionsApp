import React from 'react';
import goals_img from '/src/assets/Goals/goals.webp';
import '/src/assets/Goals/GoalsSection.css';

const goals = [
    {
        text: 'Arrange for reasonable academic accommodations for registered students.',
        color: '#f79568',
    },
    {
        text: 'Encourage registered students to develop independence by familiarizing them with policies, procedures and available resources.',
        color: '#ffde7d',
    },
    {
        text: 'Create awareness among parents and children about diagnosis, intervention and correct intervention procedures for children with developmental disorders.',
        color: '#d5f573',
    },
    {
        text: 'Give proper guidelines for the kids to school.',
        color: '#6de3e4',
    },
    {
        text: 'Train teachers as well as the parents so that child is in safe hands.',
        color: '#a78bfa',
    },
    {
        text: 'Establish a unit which will assist in formation of resource rooms at school & design and make teaching learning materials for each child.',
        color: '#f9a8d4',
    },
    {
        text: 'Initiate & support multidisciplinary therapy centers and parent groups of children with learning disturbances.',
        color: '#86efac',
    },
    {
        text: 'Take up research projects on various assessment & intervention methods and their efficacy.',
        color: '#fca5a5',
    },
    {
        text: 'Initiate various short & long term training modules on behavior management, classroom management etc. of children with learning problems.',
        color: '#93c5fd',
    },
    {
        text: 'Collaborate with different private, government and non-government agencies to spread similar models of practice in schools.',
        color: '#d8b4fe',
    },
    {
        text: 'Develop modules of management/intervention on cognitive, behavioral and emotional issues of children with learning problems.',
        color: '#fecaca',
    },
    {
        text: 'Initiate aptitude & talent based vocational centers for adults with learning disturbances.',
        color: '#bbf7d0',
    },
    {
        text: 'Support organizations on initiation of self-necessary for persons with learning disturbances.',
        color: '#bfdbfe',
    }
];

const GoalsSection = () => {
    return (
        <>
            <div className="font-sans">
                <div className="relative w-full h-96 overflow-hidden">
                    <img
                        src={goals_img}
                        alt="Header ADHD Mindmap"
                        className="object-cover w-full h-full"
                    />

                </div>
            </div>
            <section className="goals-section">
                <div className="goals-title">
                    <h2>Goals of Total Solution</h2>
                    <div className="underline" />
                </div>
                <div className="goals-list">
                    {goals.map((goal, index) => (
                        <div
                            className={`goal-card ${index % 2 === 0 ? 'slide-in-left' : 'slide-in-right'}`}
                            key={index}
                            style={{ backgroundColor: goal.color }}
                        >
                            <span className="goal-arrow">➜</span>
                            <p>{goal.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default GoalsSection;
