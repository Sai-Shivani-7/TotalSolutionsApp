import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

const Photos = () => {
  const imageModules = import.meta.glob('/src/assets/Media/PhotoGallery/*.{jpg,jpeg,png,webp}', {
    eager: true,
    import: 'default',
  });

  const galleryImages = Object.entries(imageModules).map(([path, src], index) => ({
    id: index + 1,
    src,
    alt: `Gallery Image ${index + 1} at Total Solution Rehabilitation Center`
  }));

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    // Disable body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    // Re-enable body scroll
    document.body.style.overflow = 'auto';
  };

  const goToPrev = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Image */}
      <picture>
        <source srcSet="/src/assets/Media/gallery.webp" type="image/webp" />
        <img 
          src="/src/assets/Media/gallery.webp" 
          alt="Photo Gallery at Total Solution Rehabilitation Center"
          width={1920}
          height={1080}
          loading="eager"
          decoding="sync"
          className="w-full h-auto object-cover"
        />
      </picture>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-semibold text-gray-800">Photo Gallery</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-sm shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <picture>
                  <source srcSet={image.src} type="image/webp" />
                  <img
                    src={image.src}
                    alt={image.alt}
                    width={400}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </picture>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-2xl hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            aria-label="Close lightbox"
          >
            <FiX size={28} />
          </button>

          <button
            onClick={goToPrev}
            className="absolute left-4 text-white text-2xl p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors"
            aria-label="Previous image"
          >
            <FiChevronLeft size={28} />
          </button>

          <div className="max-w-4xl w-full max-h-screen overflow-auto">
            <picture>
              <source srcSet={galleryImages[currentImageIndex].src} type="image/webp" />
              <img
                src={galleryImages[currentImageIndex].src}
                alt={galleryImages[currentImageIndex].alt}
                width={1200}
                height={800}
                loading="eager"
                decoding="sync"
                className="w-full h-auto object-contain"
              />
            </picture>
          </div>

          <button
            onClick={goToNext}
            className="absolute right-4 text-white text-2xl p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors"
            aria-label="Next image"
          >
            <FiChevronRight size={28} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Photos;