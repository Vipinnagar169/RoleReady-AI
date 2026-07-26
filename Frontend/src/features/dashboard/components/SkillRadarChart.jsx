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
        technical: 75,
        softSkills: 68,
        problemSolving: 80,
        systemDesign: 62,
        experienceMatch: 72,
        domainKnowledge: 70
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
        layout: {
            padding: {
                top: 20,
                bottom: 20,
                left: 40,
                right: 40
            }
        },
        scales: {
            r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: {
                    color: '#cbd5e1',
                    font: { size: 11, weight: '600', family: "'Inter', sans-serif" },
                    padding: 12
                },
                ticks: {
                    color: '#64748b',
                    backdropColor: 'transparent',
                    stepSize: 20,
                    font: { size: 10 }
                },
                min: 0,
                max: 100
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#f8fafc',
                    font: { size: 12 },
                    boxWidth: 14
                }
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}%`
                }
            }
        },
        maintainAspectRatio: false
    }

    return (
        <div style={{ width: '100%', height: '360px', position: 'relative' }}>
            <Radar data={data} options={options} />
        </div>
    )
}

export default SkillRadarChart
