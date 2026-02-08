import { useState } from 'react'

const API_BASE_URL = 'http://localhost:5000/api'

export default function DiseaseDetectionPage({ user }) {
  const [selectedCrop, setSelectedCrop] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const crops = [
    { id: '1', name: 'Wheat' },
    { id: '2', name: 'Rice' },
    { id: '3', name: 'Cotton' },
    { id: '4', name: 'Tomato' },
  ]

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDetect = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!image || !selectedCrop) {
      setError('Please select an image and a crop')
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('cropId', selectedCrop)

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/disease/detect`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Detection failed')
        return
      }

      setResult(data.result)
    } catch (err) {
      setError('Error during detection. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6">🔍 Disease Detection</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Upload Leaf Image</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleDetect}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Select Crop:
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="input-field"
              >
                <option value="">Choose a crop...</option>
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Upload Leaf Image (JPG, PNG, GIF):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input-field"
              />
            </div>

            {imagePreview && (
              <div className="mb-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto rounded-lg border-2 border-primary"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Analyzing...' : 'Detect Disease'}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Detection Results</h3>

            <div className="mb-4">
              <h4 className="font-semibold text-lg mb-2">{result.disease}</h4>
              <p className="text-2xl font-bold text-primary mb-2">
                {result.confidence} confidence
              </p>
              <span className={`badge ${
                result.severity === 'mild'
                  ? 'badge-success'
                  : result.severity === 'moderate'
                  ? 'badge-warning'
                  : 'badge-danger'
              }`}>
                {result.severity.toUpperCase()}
              </span>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded">
              <h5 className="font-semibold mb-2">Description:</h5>
              <p className="text-sm">{result.description}</p>
            </div>

            {result.treatment && (
              <>
                {result.treatment.organic && result.treatment.organic.length > 0 && (
                  <div className="mb-4 p-3 bg-green-50 rounded">
                    <h5 className="font-semibold mb-2">🌿 Organic Treatment:</h5>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {result.treatment.organic.map((treatment, idx) => (
                        <li key={idx}>{treatment}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.treatment.chemical && result.treatment.chemical.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded">
                    <h5 className="font-semibold mb-2">🧪 Chemical Treatment:</h5>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {result.treatment.chemical.map((treatment, idx) => (
                        <li key={idx}>{treatment}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.treatment.preventive && result.treatment.preventive.length > 0 && (
                  <div className="p-3 bg-purple-50 rounded">
                    <h5 className="font-semibold mb-2">🛡️ Preventive Measures:</h5>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {result.treatment.preventive.map((measure, idx) => (
                        <li key={idx}>{measure}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            <p className="text-xs text-gray-600 mt-4">
              Timestamp: {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
