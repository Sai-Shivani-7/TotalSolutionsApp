import React, { useState } from 'react';
import galleryBanner from '../../assets/Media/gallery.webp';

const youtubeVideos = [
  { id: 'GrkeZkOjs-4', title: 'Video 1' },
  { id: 'Ne8oS3u34cY', title: 'Video 2' },
  { id: 'Hl8z80_BEQg', title: 'Video 3' },
  { id: 'Q8k4hzBiQ4w', title: 'Video 4' },
  { id: 'd--p09oAb5A', title: 'Video 5' },
  { id: 'zKEbq4bqR4M', title: 'Video 6' },
  { id: 'Ao3RXWVAV0c', title: 'Video 7' },
  { id: 'xzJP-e2m3Rc', title: 'Video 8' },
  { id: 'HfOHGoqIhWg', title: 'Video 9' },
  { id: 'uhgrlzrbb10', title: 'Video 10' },
  { id: 'FOClRNk6-x4', title: 'Video 11' },
  { id: 'P5ohKGszqVI', title: 'Video 12' },
  { id: 'RO2UzZmopyI', title: 'Video 13' },
  { id: 'Hkffa2ve9i4', title: 'Video 14' }
];

const Videos = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <div className="bg-gray-50">
      <img src={galleryBanner} alt="Video Gallery" className="w-full object-cover" />

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-semibold text-gray-800">Videos Gallery</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {youtubeVideos.map((video, index) => (
              <div
                key={video.id}
                className="relative overflow-hidden rounded-sm shadow-md hover:shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
                onClick={() => setActiveVideo(index)}
              >
                <div className="relative aspect-video bg-black">
                  {activeVideo === index ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                      title={video.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <>
                      <img
                        src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white bg-opacity-80 rounded-full p-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>      
    </div>
  );
};

export default Videos;
