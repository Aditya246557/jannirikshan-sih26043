export default function MapLegend() {
    return (
        <div className="map-legend">

            <strong>Priority</strong>

            <div>
                <span className="legend-dot high" />
                High
            </div>

            <div>
                <span className="legend-dot medium" />
                Medium
            </div>

            <div>
                <span className="legend-dot low" />
                Low
            </div>

        </div>
    );
}