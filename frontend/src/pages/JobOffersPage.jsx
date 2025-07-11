import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import OfferList from "../components/OfferList";
import { Spinner } from "../components/ui/spinner";
import { useAuth } from "../contexts/AuthContext";

const JobOffersPage = () => {
	const { user } = useAuth();
	const { data: offres, isLoading } = useQuery({
		queryKey: ["offres"],
		queryFn: async () => {
			const response = await axiosInstance.get("/offres");
			return response.data.data || response.data.offers || response.data;
		},
		enabled: !!user,
	});

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-gray-600">Veuillez vous connecter pour voir les offres d'emploi</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
			<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<OfferList offres={offres || []} />
			</div>
		</div>
	);
};

export default JobOffersPage; 