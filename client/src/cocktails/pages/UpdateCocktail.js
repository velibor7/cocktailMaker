import React, { useContext, useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import Spinner from "../../shared/components/UIElements/Spinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";

import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";

import "./CocktailForm.css";

const UpdateCocktail = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedCocktail, setLoadedCocktail] = useState();
  const cocktailId = useParams().cocktailId;
  const history = useHistory();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: "",
      },
    },
    false
  );

  useEffect(() => {
    const fetchCocktail = async () => {
      try {
        const resData = await sendRequest(
          `http://localhost:5000/api/cocktails/${cocktailId}`
        );
        setLoadedCocktail(resData.cocktail);
        setFormData(
          {
            title: {
              value: resData.cocktail.title,
              isValid: true,
            },
            description: {
              value: resData.cocktail.description,
              isValid: true,
            },
          },
          true
        );
      } catch (err) {}
      fetchCocktail();
    };
  }, [sendRequest, cocktailId, setFormData]);

  const cocktailUpdateSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      await sendRequest(
        `http://localhost:5000/api/cocktails/${cocktailId}`,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      );
      history.push("/", auth.userId + "/cocktails");
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="center">
        <Spinner />
      </div>
    );
  }

  if (!loadedCocktail && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find a cocktail</h2>
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedCocktail && (
        <form className="cocktail-form" onSubmit={cocktailUpdateSubmitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="plase enter a valid title"
            onInput={inputHandler}
            initialValue={loadedCocktail.title}
            initialValid={true}
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="plase enter a valid desc."
            onInput={inputHandler}
            initialValue={loadedCocktail.description}
            initialValid={true}
          />

          <Button type="submit" disabled={!formState.isValid}>
            UPDATE
          </Button>
        </form>
      )}
    </React.Fragment>
  );
};

export default UpdateCocktail;
