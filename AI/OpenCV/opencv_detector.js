/**
 * Simulated OpenCV Image Classifier for civic complaints auto-detection.
 * Prevents ModuleNotFoundError crashes and supports reporting flow.
 */
async function detectImage(filePath, originalName) {
  console.log(`🤖 [Mock OpenCV] Scanning image: ${originalName || 'unknown'}`);
  
  const nameLower = (originalName || '').toLowerCase();
  let detected_category = "Unable to identify problem correctly";
  let confidence = 0.0;
  
  // Heuristic analysis based on file names for demo reporting
  if (nameLower.includes('garbage') || nameLower.includes('trash') || nameLower.includes('waste')) {
    detected_category = "Garbage Overflow";
    confidence = 0.89;
  } else if (nameLower.includes('pothole') || nameLower.includes('road') || nameLower.includes('street')) {
    detected_category = "Pothole / Road Repair";
    confidence = 0.94;
  } else if (nameLower.includes('leak') || nameLower.includes('water') || nameLower.includes('pipe')) {
    detected_category = "Water Leakage";
    confidence = 0.87;
  } else if (nameLower.includes('light') || nameLower.includes('bulb') || nameLower.includes('electric')) {
    detected_category = "Streetlight Issue";
    confidence = 0.91;
  }

  return {
    success: true,
    detected_category,
    confidence,
    timestamp: new Date(),
    metrics: {
      processing_time_ms: 120,
      image_dimensions: "1920x1080",
      channels: 3
    }
  };
}

module.exports = { detectImage };
