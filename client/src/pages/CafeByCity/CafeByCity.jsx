import React, { useState, useEffect } from "react";
import CafeCard from "../../components/CafeCard/CafeCard";
import Pagination from "../../components/Pagination/Pagination";
import { useLocation } from "react-router-dom";
import FilterButtons from "../../components/FilterButtons/FilterButtons";

const CafeByCity = () => {
  const location = useLocation();
  const [error, setError] = useState(location.state?.error || null);
  const [isLoading, setIsLoading] = useState(
    location.state?.isLoading || false,
  );
  const [cafes, setCafes] = useState(location.state?.cafes?.data || []);
  const [totalPages, setTotalPages] = useState(
    location.state?.cafes?.totalPages || 1,
  );
  const [currentPage, setCurrentPage] = useState(
    location.state?.currentPage || 1,
  );
  const [favorites, setFavorites] = useState([]);
  const city = location.state?.city;

  const fetchCafes = async (page, filter = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const filterParam = filter !== null ? `&food-options=${filter}` : "";
      const response = await fetch(
        `${process.env.BASE_SERVER_URL}/api/cafes?city=${city}&page=${page}&limit=10&${filterParam}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Fetch failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setCafes(data.result.data);
        setTotalPages(data.result.totalPages);
      } else {
        setError("Failed to fetch cafes.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSelection = (filter) => {
    setCurrentPage(1);
    fetchCafes(1, filter.index);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchCafes(newPage);
  };

  const handleFavoriteToggle = (cafeId, newIsFav) => {
    const updatedFavorites = newIsFav
      ? [...favorites, cafeId]
      : favorites.filter((id) => id !== cafeId);

    setFavorites(updatedFavorites);
  };

  useEffect(() => {
    if (!cafes.length && city) {
      fetchCafes(currentPage);
    }
  }, [city, cafes.length, currentPage]);

  return (
    <div className="flex justify-center items-center">
      <div className="w-[90%] my-4 mx-auto p-2">
        <h1 className="text-2xl font-bold my-10 mb-10 border-b-4 border-stone-100 p-4  text-center sm:text-4xl">
          Cafes in {city}
        </h1>

        <div>
          <h4 className="text-xl font-semibold text-center my-2 ">
            Looking for a particular food option ?
          </h4>
          <FilterButtons onFilterSelection={handleFilterSelection} />
        </div>
        <div className="flex flex-row flex-wrap justify-center w-full p-2 gap-5">
          {isLoading && <p>Loading...</p>}
          {error && <p>{error}</p>}
          {cafes.map((cafe) => (
            <CafeCard
              key={cafe._id}
              cafe={cafe}
              isFavorite={favorites.includes(cafe._id)}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default CafeByCity;
