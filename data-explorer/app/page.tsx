"use client";
import ResearchExplorer from '@/components/ResearchExplorer'
import researchData from '@/data/research-data.json'
import metricsData from '@/data/metrics-data.json'
export default function Home() {
  return (
    <main>
      <ResearchExplorer researchData={researchData} metricsData={metricsData} />
    </main>
  )
}