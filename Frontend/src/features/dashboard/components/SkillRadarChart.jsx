import React from 'react'
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js'
import { Radar } from 'react-chartjs-2'

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
)

const SkillRadarChart = ({ scores }) => {
    const defaultScores = {
        technical: 85,
        softSkills: 78,
        problemSolving: 90,
        systemDesign: 72,
        experienceMatch: 88,
        domainKnowledge: 80
    }

    const dataScores = scores || defaultScores

    const data = {
        labels: [
            'Technical Skills',
            'Soft Skills',
            'Problem Solving',
            'System Design',
            'Experience Match',
            'Domain Knowledge'
        ],
        datasets: [
            {
                label: 'Candidate Match Rating (%)',
                data: [
                    dataScores.technical,
                    dataScores.softSkills,
                    dataScores.problemSolving,
                    dataScores.systemDesign,
                    dataScores.experienceMatch,
                    dataScores.domainKnowledge
                ],
                backgroundColor: 'rgba(99, 102, 241, 0.25)',
                borderColor: '#6366f1',
                borderWidth: 2,
                pointBackgroundColor: '#818cf8',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#6366f1'
            }
        ]
    }

    const options = {
        scales: {
            r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: {
                    color: '#94a3b8',
                    font: { size: 12, weight: 'bold' }
                },
                ticks: {
                    color: '#64748b',
                    backdropColor: 'transparent',
                    stepSize: 20
                },
                min: 0,
                max: 100
            }
        },
        plugins: {
            legend: {
                labels: { color: '#f8fafc', font: { size: 13 } }
            }
        },
        maintainAspectRatio: false
    }

    return (
        <div style={{ width: '100%', height: '350px' }}>
            <Radar data={data} options={options} />
        </div>
    )
}

export default SkillRadarChart
