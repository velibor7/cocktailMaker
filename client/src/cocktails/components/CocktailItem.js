import React, { useState } from "react";

import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import Modal from "../../shared/components/UIElements/Modal";

import "./CocktailItem.css";
import { useHttpClient } from "../../shared/hooks/http-hook";

const CocktailItem = (props) => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const cancelDetailsHandler = () => {
    setShowDetailsModal(false);
  };
  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        `http://localhost:5000/api/cocktails/${props.id}`,
        "DELETE"
      );
      props.onDelete(props.id);
    } catch (err) {}
  };

  const popDetailsModal = () => {
    setShowDetailsModal(true);
  };

  return (
    <React.Fragment>
      <Modal
        show={showDetailsModal}
        onCancel={cancelDetailsHandler}
        header={props.title}
        footerClass="cocktail-item__modal-actions"
        footer={
          <React.Fragment>
            <div className="cocktail-item__actions">
              <Button inverse to={`/cocktails/${props.id}`}>
                UPDATE
              </Button>
              <Button danger onClick={showDeleteWarningHandler}>
                DELETE
              </Button>
            </div>
          </React.Fragment>
        }
      >
        {props.description}
      </Modal>

      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="cocktail-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </React.Fragment>
        }
      >
        This can't be undone
      </Modal>
      <li className="cocktail-item" onClick={popDetailsModal}>
        <Card className="cocktail-item__content">
          {isLoading && <p>Loading...</p>}
          <div className="cocktail-item__image">
            <img
              src={`http://localhost:5000/${props.image}`}
              alt={props.title}
            />
          </div>

          <div className="cocktail-item__info">
            <h2>{props.title}</h2>
          </div>
          {/*
          <div className="cocktail-item__actions">
          <Button to={`cocktails/${props.id}`}>EDIT</Button>
          <Button danger onClick={showDeleteWarningHandler}>
          DELETE
          </Button>
          </div>
        */}
        </Card>
      </li>
    </React.Fragment>
  );
};

export default CocktailItem;
