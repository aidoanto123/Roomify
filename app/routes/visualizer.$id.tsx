import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import puter from '@heyputer/puter.js';
import Navbar from '../../components/Navbar';

const VisualizerId = () => {
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadImage = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const path = `uploads/${id}`;
                const data = await puter.fs.read(path);
                
                if (data instanceof Blob) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setImageUrl(reader.result as string);
                        setLoading(false);
                    };
                    reader.readAsDataURL(data);
                } else if (typeof data === 'string') {
                    // Check if it's already a data URI or just base64
                    if (data.startsWith('data:')) {
                        setImageUrl(data);
                    } else {
                        setImageUrl(`data:image/png;base64,${data}`);
                    }
                    setLoading(false);
                } else {
                    throw new Error("Invalid resource format");
                }
            } catch (err) {
                console.error("Failed to load resource:", err);
                setError("Resource not found or unavailable");
                setLoading(false);
            }
        };

        loadImage();
    }, [id]);

    return (
        <div className="visualizer-page">
            <Navbar />
            <main className="container mx-auto pt-24 px-4">
                <div className="max-w-4xl mx-auto">
                    {loading && (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-lg text-gray-500">Loading resource...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                            <h2 className="text-xl font-semibold text-red-700 mb-2">Unavailable</h2>
                            <p className="text-red-600">{error}</p>
                            <button 
                                onClick={() => window.location.href = '/'}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Back to Home
                            </button>
                        </div>
                    )}

                    {imageUrl && !loading && (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-medium">Uploaded Floor Plan</h3>
                                <span className="text-xs text-gray-400">ID: {id}</span>
                            </div>
                            <div className="aspect-auto w-full flex justify-center bg-gray-900 p-8">
                                <img 
                                    src={imageUrl} 
                                    alt="Uploaded floor plan" 
                                    className="max-w-full h-auto rounded shadow-2xl"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default VisualizerId