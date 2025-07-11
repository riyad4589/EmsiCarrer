import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { Heart, MessageCircle, Send, Briefcase, MapPin, Clock, Users, Star, Upload, FileText, Calendar, Building2, Target, ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight } from "lucide-react";
// Helper function to format dates
const formatDistanceToNow = (date) => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 60) {
    return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  } else if (diffInHours < 24) {
    return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  } else {
    return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }
};

const OfferList = ({ offres }) => {
  const queryClient = useQueryClient();
  const [showApply, setShowApply] = useState({});
  const [cvFiles, setCvFiles] = useState({});
  const [lettreFiles, setLettreFiles] = useState({});
  const [commentContent, setCommentContent] = useState({});
  const [showComments, setShowComments] = useState({});
  const [expandedOffers, setExpandedOffers] = useState({});
  const [imageModal, setImageModal] = useState({ isOpen: false, currentImage: null, images: [], currentIndex: 0 });

  const applyMutation = useMutation({
    mutationFn: async ({ offreId, cvFile, lettreFile }) => {
      const formData = new FormData();
      if (cvFile) formData.append("cv", cvFile);
      if (lettreFile) formData.append("lettreMotivation", lettreFile);
      await axiosInstance.post(`/offres/${offreId}/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Candidature envoyée !");
      setCvFiles({});
      setLettreFiles({});
      setShowApply({});
      queryClient.invalidateQueries(["offres"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de la candidature");
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (offreId) => {
      await axiosInstance.post(`/offres/${offreId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["offres"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors du like");
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ offreId, content }) => {
    await axiosInstance.post(`/offres/${offreId}/comments`, { content });
    },
    onSuccess: () => {
      toast.success("Commentaire ajouté !");
      setCommentContent({});
      queryClient.invalidateQueries(["offres"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors du commentaire");
    },
  });

  const openImageModal = (images, currentIndex = 0) => {
    setImageModal({
      isOpen: true,
      currentImage: images[currentIndex],
      images: images,
      currentIndex: currentIndex
    });
  };

  const closeImageModal = () => {
    setImageModal({ isOpen: false, currentImage: null, images: [], currentIndex: 0 });
  };

  const nextImage = () => {
    const nextIndex = (imageModal.currentIndex + 1) % imageModal.images.length;
    setImageModal(prev => ({
      ...prev,
      currentIndex: nextIndex,
      currentImage: prev.images[nextIndex]
    }));
  };

  const prevImage = () => {
    const prevIndex = imageModal.currentIndex === 0 ? imageModal.images.length - 1 : imageModal.currentIndex - 1;
    setImageModal(prev => ({
      ...prev,
      currentIndex: prevIndex,
      currentImage: prev.images[prevIndex]
    }));
  };

  const handleKeyDown = (e) => {
    if (!imageModal.isOpen) return;
    
    if (e.key === 'Escape') {
      closeImageModal();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    }
  };

  // Gestion des événements clavier
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (!imageModal.isOpen) return;
      
      if (e.key === 'Escape') {
        closeImageModal();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };

    if (imageModal.isOpen) {
      document.addEventListener('keydown', handleGlobalKeyDown);
      document.body.style.overflow = 'hidden'; // Empêcher le scroll
    }

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
      document.body.style.overflow = 'unset'; // Restaurer le scroll
    };
  }, [imageModal.isOpen]);

  if (!offres || offres.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-emerald-50 to-green-100 rounded-full flex items-center justify-center">
            <Briefcase size={48} className="text-emerald-600" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Star size={16} className="text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Aucune offre disponible</h3>
        <p className="text-gray-500 text-lg max-w-md">
          Les nouvelles opportunités arrivent bientôt. Restez connecté pour ne rien manquer !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {offres.map((offre, index) => (
        <div
          key={offre._id}
          className="group relative bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100/50"
          style={{
            animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
          }}
        >
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
          
          {/* Main content */}
          <div className="p-8">
            {/* Header section */}
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  <Building2 size={28} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Target size={12} className="text-white" />
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors duration-300">
                      {offre.titre}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} className="text-emerald-500" />
                        <span className="font-medium">{offre.localisation}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase size={16} className="text-green-500" />
                        <span className="font-medium">{offre.typeContrat}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
                    <Clock size={16} className="text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">
                      {formatDistanceToNow(new Date(offre.createdAt))}
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <p className={`text-gray-700 leading-relaxed transition-all duration-300 ${
                    expandedOffers[offre._id] ? '' : 'line-clamp-3'
                  }`}>
                    {offre.description}
                  </p>
                  {offre.description.length > 150 && (
                    <button
                      onClick={() => setExpandedOffers(prev => ({ ...prev, [offre._id]: !prev[offre._id] }))}
                      className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1"
                    >
                      {expandedOffers[offre._id] ? (
                        <>Voir moins <ChevronUp size={16} /></>
                      ) : (
                        <>Voir plus <ChevronDown size={16} /></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Skills section */}
            {offre.competencesRequises?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Target size={16} className="text-emerald-500" />
                  Compétences requises
                </h4>
                <div className="flex flex-wrap gap-2">
                  {offre.competencesRequises.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 text-sm font-medium rounded-full border border-emerald-200 hover:shadow-md transition-all duration-200 cursor-default"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Media section */}
{offre.medias?.length > 0 && (
  <div className="mb-6">
    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
      Galerie photos
    </h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {offre.medias.map((mediaUrl, idx) => (
        <div key={idx} className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
          {mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
            <div className="relative">
              <video 
                src={mediaUrl} 
                controls 
                className="w-full h-48 object-cover rounded-2xl shadow-sm group-hover:shadow-lg transition-all duration-300" 
              />
              <div className="absolute top-3 left-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs font-medium">
                Vidéo
              </div>
            </div>
          ) : (
            <div 
              onClick={() => {
                const imageUrls = offre.medias.filter(url => !url.match(/\.(mp4|webm|ogg|mov)$/i));
                openImageModal(imageUrls, imageUrls.indexOf(mediaUrl));
              }}
              className="relative cursor-pointer group/image"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                <img 
                  src={mediaUrl} 
                  alt="Photo de l'offre" 
                  className="w-full h-full object-cover group-hover/image:scale-110 transition-all duration-500 ease-out"
                  loading="lazy"
                />
              </div>
              
              {/* Overlay avec effet de zoom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-all duration-300 rounded-2xl"></div>
              
              {/* Indicateur de zoom */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full opacity-0 group-hover/image:opacity-100 transition-all duration-300 transform scale-75 group-hover/image:scale-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
              
              {/* Badge image */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                Photo
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}


            {/* Action buttons */}
            <div className="flex items-center justify-between py-4 border-t border-gray-100">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => likeMutation.mutate(offre._id)} 
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-red-50 transition-all duration-200 group"
                >
                  <Heart size={18} className="text-red-500 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium text-gray-700 group-hover:text-red-600">
                    {offre.likes?.length || 0}
                  </span>
                </button>
                
                <button 
                  onClick={() => setShowComments(prev => ({ ...prev, [offre._id]: !prev[offre._id] }))} 
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-blue-50 transition-all duration-200 group"
                >
                  <MessageCircle size={18} className="text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium text-gray-700 group-hover:text-blue-600">
                    {offre.comments?.length || 0}
                  </span>
                </button>
              </div>
              
              <button 
                onClick={() => setShowApply(prev => ({ ...prev, [offre._id]: !prev[offre._id] }))} 
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Briefcase size={18} />
                Postuler maintenant
              </button>
            </div>

            {/* Application form */}
            {showApply[offre._id] && (
              <div className="mt-6 p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Send size={20} className="text-emerald-600" />
                  Postuler pour ce poste
                </h4>
                
                <div
                  onSubmit={e => {
                    e.preventDefault();
                    applyMutation.mutate({
                      offreId: offre._id,
                      cvFile: cvFiles[offre._id],
                      lettreFile: lettreFiles[offre._id],
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <FileText size={16} className="text-emerald-600" />
                        CV (PDF) *
                      </label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="application/pdf" 
                          required 
                          onChange={e => setCvFiles(prev => ({ ...prev, [offre._id]: e.target.files[0] }))} 
                          className="w-full p-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
                        />
                        <Upload size={20} className="absolute right-3 top-3 text-emerald-500" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <FileText size={16} className="text-green-600" />
                        Lettre de motivation (optionnel)
                      </label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="application/pdf" 
                          onChange={e => setLettreFiles(prev => ({ ...prev, [offre._id]: e.target.files[0] }))} 
                          className="w-full p-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                        />
                        <Upload size={20} className="absolute right-3 top-3 text-green-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        applyMutation.mutate({
                          offreId: offre._id,
                          cvFile: cvFiles[offre._id],
                          lettreFile: lettreFiles[offre._id],
                        });
                      }}
                      disabled={applyMutation.isPending} 
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {applyMutation.isPending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Envoyer ma candidature
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowApply(prev => ({ ...prev, [offre._id]: false }))}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments section */}
            {showComments[offre._id] && (
              <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageCircle size={20} className="text-blue-500" />
                  Commentaires
                </h4>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={commentContent[offre._id] || ""}
                      onChange={e => setCommentContent(prev => ({ ...prev, [offre._id]: e.target.value }))}
                      placeholder="Partagez votre avis sur cette offre..."
                      className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>
                  <button 
                    onClick={() => commentMutation.mutate({ offreId: offre._id, content: commentContent[offre._id] })} 
                    className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Send size={20} />
                  </button>
                </div>
                
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {offre.comments?.length > 0 ? (
                    offre.comments.map((comment) => (
                      <div key={comment._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <Users size={14} className="text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{comment.user?.name || "Utilisateur anonyme"}</div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar size={12} />
                              {new Date(comment.createdAt).toLocaleString('fr-FR')}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed ml-11">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle size={32} className="mx-auto mb-3 opacity-50" />
                      <p>Aucun commentaire pour le moment</p>
                      <p className="text-sm">Soyez le premier à donner votre avis !</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={closeImageModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeImageModal}
              className="absolute top-6 right-6 z-20 bg-white/90 text-gray-800 p-3 rounded-full hover:bg-white transition-all duration-200 border border-gray-200 hover:scale-110 shadow-lg"
            >
              <X size={24} />
            </button>

            {/* Navigation buttons */}
            {imageModal.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 text-gray-800 p-4 rounded-full hover:bg-white transition-all duration-200 border border-gray-200 hover:scale-110 shadow-lg"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 text-gray-800 p-4 rounded-full hover:bg-white transition-all duration-200 border border-gray-200 hover:scale-110 shadow-lg"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            {/* Image counter */}
            {imageModal.images.length > 1 && (
              <div className="absolute top-6 left-6 z-20 bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 shadow-lg">
                {imageModal.currentIndex + 1} / {imageModal.images.length}
              </div>
            )}

            {/* Image container */}
            <div className="relative w-full h-full flex items-center justify-center p-8">
              <img
                src={imageModal.currentImage}
                alt="Image en plein écran"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxHeight: 'calc(100vh - 4rem)',
                  maxWidth: 'calc(100vw - 4rem)'
                }}
              />
            </div>

            {/* Instructions */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 opacity-0 hover:opacity-100 transition-opacity duration-300 shadow-lg">
              <span className="hidden sm:inline">Utilisez les flèches ou cliquez pour naviguer • Échap pour fermer</span>
              <span className="sm:hidden">Tapez pour naviguer • Échap pour fermer</span>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default OfferList;