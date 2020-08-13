import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";

import { useHttpClient } from "../../shared/hooks/http-hook";
import CocktailList from "../components/CocktailList";

const Home = () => {
  /*
  const [loadedCocktails, setLoadedCocktails] = useState([
    {
      id: "c1",
      title: "Some Cocktail",
      description:
      "An amazing cocktail with lots of flavor fahdskjlsal fjdsf jasklfj dasj; fsjfkl asdjflkdajfkldaj lk;fjfkl sdjfkla; ",
      ingredients: ["Vodka", "Gin", "Lemon lime soda", "Oranges"],
      image: "no",
    },
    {
      id: "c2",
      title: "Other cocktail",
      description: "Idk, a lot of flavor etc.",
      ingredients: ["Vodka", "Gin", "Lemon lime soda", "Oranges"],
      image: "no",
    },
    
    {
      id: "c3",
      title: "Other cocktail 3",
      description: "Idk, a lot of flavor etc.",
      ingredients: ["Vodka", "Gin", "Lemon lime soda", "Oranges"],
      image: "no",
    },
    {
      id: "c4",
      title: "Other cocktail 4",
      description: "Idk, a lot of flavor etc.",
      ingredients: ["Vodka", "Gin", "Lemon lime soda", "Oranges"],
      image: "no",
    },
    {
      id: "c5",
      title: "Other cocktail 5",
      description: "Idk, a lot of flavor etc.",
      ingredients: ["Vodka", "Gin", "Lemon lime soda", "Oranges"],
      image: "no",
    },
    
    
  ]);
  */
  const [loadedCocktails, setLoadedCocktails] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  // const userId = useParams().userId;

  useEffect(() => {
    const fetchCocktails = async () => {
      try {
        const resData = await sendRequest(
          `http://localhost:5000/api/cocktails/`
        );
        setLoadedCocktails(resData.cocktails);
      } catch (err) {
        console.log(err);
      }
    };
    fetchCocktails();
  }, [sendRequest]);

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
        ></CocktailList>
      )}
    </React.Fragment>
  );
};

export default Home;
