import React from 'react';
import styled from 'styled-components';

const Checkbox = () => {
    return (
        <StyledWrapper>
            <div className="checkbox-container">
                <div className="checkbox-wrapper">
                    <input className="checkbox" id="checkbox" type="checkbox" />
                    <label className="checkbox-label" htmlFor="checkbox">
                        <div className="checkbox-flip">
                            <div className="checkbox-front">
                                <svg fill="white" height={32} width={32} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 13H12V19H11V13H5V12H11V6H12V12H19V13Z" className="icon-path" />
                                </svg>
                            </div>
                            <div className="checkbox-back">
                                <svg fill="white" height={32} width={32} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 19l-7-7 1.41-1.41L9 16.17l11.29-11.3L22 6l-13 13z" className="icon-path" />
                                </svg>
                            </div>
                        </div>
                    </label>
                </div>
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  .checkbox-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    margin: 0;
  }

  .checkbox {
    display: none;
  }

  .checkbox-label {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
  }

  .checkbox-flip {
    width: 60px;
    height: 60px;
    perspective: 1000px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    transition: transform 0.4s ease;
  }

  .checkbox-front,
  .checkbox-back {
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    backface-visibility: hidden;
    transition: transform 0.3s ease;
  }

  .checkbox-front {
    background: linear-gradient(135deg, #ff6347, #f76c6c);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: rotateY(0deg);
  }

  .checkbox-back {
    background: linear-gradient(135deg, #36b54a, #00c1d4);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: rotateY(180deg);
  }

  .checkbox-wrapper:hover .checkbox-flip {
    transform: scale(1.1);
    transition: transform 0.4s ease-out;
  }

  .checkbox:checked + .checkbox-label .checkbox-front {
    transform: rotateY(180deg);
  }

  .checkbox:checked + .checkbox-label .checkbox-back {
    transform: rotateY(0deg);
  }

  .checkbox:focus + .checkbox-label .checkbox-flip {
    box-shadow:
      0 0 15px rgba(54, 181, 73, 0.7),
      0 0 20px rgba(0, 193, 212, 0.4);
    transition: box-shadow 0.3s ease;
  }

  .icon-path {
    stroke: white;
    stroke-width: 2;
    fill: transparent;
  }`;

export default Checkbox;
