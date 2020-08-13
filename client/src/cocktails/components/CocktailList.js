import React from "react";

import CocktailItem from "./CocktailItem";
import "./CocktailList.css";

const CocktailList = (props) => {
  return (
    <ul className="cocktail-list">
      {props.items.map((cocktail) => (
        <CocktailItem
          key={cocktail.id}
          id={cocktail.id}
          image={cocktail.image}
          title={cocktail.title}
          description={cocktail.description}
          ingredients={cocktail.ingredients}
          creatorId={cocktail.creator}
          onDelete={props.onDeleteCocktail}
        />
      ))}
    </ul>
  );
};

export default CocktailList;
