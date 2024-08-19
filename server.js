const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all origins
app.use(cors());

app.use(express.json());

function convertToMeters(value, unit) {
    const conversionFactors = {
        "in": 0.0254,
        "cm": 0.01,
        "mm": 0.001,
        "m": 1,
        "ft": 0.3048
    };
    return value * (conversionFactors[unit] || 1);
}

app.post('/calculate', (req, res) => {
    try {
        const { diameter, length, density, diameter_unit, length_unit, volume_unit } = req.body;

        if (!diameter || !length || !density) {
            return res.status(400).json({ error: "Please provide valid inputs for diameter, length, and density." });
        }

        const diameterInMeters = convertToMeters(diameter, diameter_unit);
        const lengthInMeters = convertToMeters(length, length_unit);
        const radiusInMeters = diameterInMeters / 2;
        const volumeInCubicMeters = Math.PI * Math.pow(radiusInMeters, 2) * lengthInMeters;

        let volume;
        switch (volume_unit) {
            case "cubic meters":
                volume = volumeInCubicMeters;
                break;
            case "liters":
                volume = volumeInCubicMeters * 1000;
                break;
            case "cubic feet":
                volume = volumeInCubicMeters * 35.3147;
                break;
            case "gallons":
                volume = volumeInCubicMeters * 264.172;
                break;
            default:
                volume = volumeInCubicMeters;
                break;
        }

        const massInKg = volumeInCubicMeters * density;
        const massInLbs = massInKg * 2.20462;

        res.json({
            volume: `${volume.toFixed(2)} ${volume_unit}`,
            mass_kg: `${massInKg.toFixed(2)} kg`,
            mass_lbs: `${massInLbs.toFixed(2)} lbs`
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
