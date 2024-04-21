import p5 from 'p5'
import { useEffect, useRef } from 'react'

export default function MemberCard({
	width,
	height,
}: {
	width: number
	height: number
}) {
	const renderRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		let instance: p5
		if (window && renderRef.current) {
			instance = new p5(p => {
				p.setup = () => p.createCanvas(width, height).parent(renderRef.current)

				p.draw = () => {
					const rows = 10
					const columns = 10
					p.background(255)

					let allColumnsPoints: p5.Vector[][] = []

					// Create points in columns and rows
					for (let row = 0; row < rows; row++) {
						let columnPoints: p5.Vector[] = []
						for (let col = 0; col < columns; col++) {
							let x = (width / rows) * row
							let y = (height / columns) * col
							if (row === 0) x = 0
							if (col === 0) y = 0
							columnPoints.push(
								p.createVector(
									x + p.random(width / rows),
									y + p.random(height / columns),
								),
							)
						}
						allColumnsPoints.push(columnPoints)
					}

					//Interpolate and draw between columns
					allColumnsPoints.forEach((currentPoints, i) => {
						let nextPoints = allColumnsPoints[i + 1]

						let interpolation_steps = 9
						for (
							let interpolation_step = 0;
							interpolation_step < interpolation_steps;
							interpolation_step++
						) {
							p.beginShape()
							for (
								let pointIndex = 0;
								pointIndex < currentPoints.length;
								pointIndex++
							) {
								let startPt = currentPoints[pointIndex]
								let endPt = nextPoints[pointIndex]
								let interPt = p5.Vector.lerp(
									startPt,
									endPt,
									interpolation_step / interpolation_steps,
								)
								p.vertex(interPt.x, interPt.y)
							}
							p.endShape(p.CLOSE)
						}
					})
					p.noLoop()
				}
			})
		}
		return () => (instance ? instance.remove() : undefined)
	}, [width, height])
	return <div ref={renderRef} />
}
