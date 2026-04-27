"use client"

import { useMemo } from "react"
import ReactFlow, { Background, Controls } from "reactflow"
import "reactflow/dist/style.css"

export default function PropagationGraph({ detections }) {
  const { nodes, edges } = useMemo(() => {
    const sorted = [...detections].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    const nodesData = sorted.map((d, i) => ({
      id: d.detection_id,
      data: {
        label: `${d.source.platform} / ${d.source.uploader} / ${d.views} views`
      },
      position: { x: 60 + i * 220, y: 100 },
      style: {
        borderRadius: 16,
        border: "1px solid #1f78ff",
        width: Math.max(180, 140 + Math.floor(Math.min(d.views, 100000) / 2000)),
        padding: 8
      }
    }))
    const edgesData = sorted.slice(1).map((d, i) => ({
      id: `${sorted[i].detection_id}-${d.detection_id}`,
      source: sorted[i].detection_id,
      target: d.detection_id,
      animated: true
    }))
    return { nodes: nodesData, edges: edgesData }
  }, [detections])

  return (
    <div className="card" style={{ height: 340, width: "100%", padding: 0 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
