import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CocktailList from "../components/CocktailList";
import { useHttpClient } from "../../shared/hooks/http-hook";

const UserCocktails = () => {
  const [loadedCocktails, setLoadedCocktails] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const userId = useParams().userId;

  useEffect(() => {
    const fetchCocktails = async () => {
      try {
        const resData = await sendRequest(
          `http://localhost:5000/api/cocktails/user/${userId}`
        );
        setLoadedCocktails(resData.cocktails);
      } catch (err) {}
    };
    fetchCocktails();
  }, [sendRequest, userId]);

  const cocktailDeletedHandler = (deletedCocktailId) => {
    setLoadedCocktails((prevCocktails) =>
      prevCocktails.filter((cocktail) => cocktail.id !== deletedCocktailId)
    );
  };

  return (
    <React.Fragment>
      {!isLoading && loadedCocktails && (
        <CocktailList
          items={loadedCocktails}
          onDeleteCocktail={cocktailDeletedHandler}
        />
      )}
    </React.Fragment>
  );
};

export default UserCocktails;
