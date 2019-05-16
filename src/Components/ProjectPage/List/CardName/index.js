import React, { Component } from 'react';
import './index.scss';

export default class Card extends Component {
    constructor(props) {
        super();
        this.state = {
            cards: props.cards,
            isVisibleLayer: false,
            isdropMouseElement: false,
            isDrag: false,
            dragObject: {},
            oldPosition: {},
            newPosition: {},
            layer: {
                height: '',
                width: ''
            }            
        }
        this.$layer = React.createRef();
        this.$cardName = React.createRef();
    }

    onMouseDown = (event) => {

        //const mouseDownElement = document.elementFromPoint(event.clientX, event.clientY);
        //  parentElement.style.pointerEvents = 'none';
        //  console.log(parentElement);
        let shiftX = event.pageX - this.$cardName.current.getBoundingClientRect().left + 8;
        let shilfY = event.pageY - this.$cardName.current.getBoundingClientRect().top + 59;

        this.setState({
            shiftX,
            shilfY,
            cursor: {
                x: event.pageX,
                y: event.pageY
            },
            oldPosition: {
                x: 0,
                y: this.$cardName.current.getBoundingClientRect().top
            },
            layer: {
                height: this.$cardName.current.offsetHeight -
                    parseFloat(getComputedStyle(this.$cardName.current).paddingTop) -
                    parseFloat(getComputedStyle(this.$cardName.current).paddingBottom),
                width: this.$cardName.current.offsetWidth -
                    parseFloat(getComputedStyle(this.$cardName.current).paddingRight) -
                    parseFloat(getComputedStyle(this.$cardName.current).paddingLeft)
            }
        });

        document.addEventListener('mousemove', this.handleMouseMoveListValue);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleMouseMoveListValue);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    handleMouseMoveListValue = (event) => {
        const { isDropCard } = this.props;
        const { shiftX, shilfY, layer, isDrag, cursor } = this.state;

        let dragObject;

        this.setState({
            isDrag: true
        });

        if (!isDrag || !this.$cardName.current) {
            return;
        }

        if ((Math.abs(cursor.x - event.pageX) > 3) && (Math.abs(cursor.y - event.pageY) > 3)) {

            dragObject = this.$cardName.current;
            
            const dropMouseElement = document.elementFromPoint(event.clientX, event.clientY);

            isDropCard(true);
            this.setState({
                isVisibleLayer: true
            });
            this.$cardName.current.style.userSelect = 'none';
            this.$cardName.current.style.zIndex = 9999;
            this.$cardName.current.style.position = 'absolute';
            this.$cardName.current.style.left = `${event.pageX - shiftX}px`;
            this.$cardName.current.style.top = `${event.pageY - shilfY}px`;
            this.$cardName.current.style.transform = 'rotate(3deg)';
            this.$cardName.current.style.pointerEvents = 'none';

            if (!dropMouseElement) {
                return;
            }
            // Для того чтобы детектить когда перетаскивый элемент не над самим листом, а над областью под ним
            const listWrapperDropped = dropMouseElement.closest('.list-wrapper');

            if (listWrapperDropped) {
                this.setState({
                    listWrapperDropped,
                    listDropped: null
                });
            }
            // Лист на который перетаскиваем
            const listDropped = dropMouseElement.closest('[droppable="droppable"]');

            if (listDropped) {
                this.setState({
                    listWrapperDropped: null,
                    listDropped
                });
            }
            // Находится ли перетаскиваемый элемент над картой
            const isCardDropped = dropMouseElement ? dropMouseElement.matches('[card="card"]') : null;

            // Перетаскиваемый объект над областью под листом
            if (listWrapperDropped && !listDropped) {
                const list = listWrapperDropped.childNodes[1];

                if (list) {
                    const cardsWrapper = list.childNodes[1];
                    cardsWrapper.appendChild(this.$layer.current);
                    const coordsTargetElem = this.$layer.current.getBoundingClientRect();
                    this.setState({
                        newPosition: {
                            x: coordsTargetElem.left,
                            y: coordsTargetElem.top
                        }
                    });
                }              
            }

            // Перетаскиваемый объект попал над карту
            if (isCardDropped) {
                const cardDropped = dropMouseElement.closest('[card="card"]');
                const cardsWrapper = cardDropped.parentNode;
                const coords = cardDropped.getBoundingClientRect();

                if (cardDropped) {
                    this.setState({
                        cardDropped,
                        isWasCardDropped: true
                    });
                }

                if (Math.abs(event.pageY - coords.top) > Math.abs(coords.top - coords.bottom) / 1.2) {
                    return;
                }


                
                cardsWrapper.insertBefore(this.$layer.current, cardDropped);
                const coordsTargetElem = this.$layer.current.getBoundingClientRect();

                this.setState({
                    newPosition: {
                        x: coordsTargetElem.left,
                        y: coordsTargetElem.top
                    }
                });
            }

            if (this.$cardName.current) {
                this.$cardName.current.style.height = `${layer.height}px`;
                this.$cardName.current.style.width = `${layer.width}px`;
            }
        }

        return false;
    };

    onMouseUp = (event) => {
        const { isDropCard } = this.props;
        const { oldPosition, newPosition, isWasCardDropped, cardDropped, listWrapperDropped, listDropped } = this.state;

        if (!this.$cardName.current) {
            return;
        }

        isDropCard(false);

        document.removeEventListener('mousemove', this.handleMouseMoveListValue);
        document.removeEventListener('mouseup', this.onMouseUp);

        this.$cardName.current.style.pointerEvents = 'none';

        if (listWrapperDropped && !listDropped) {
            const { updateCardNames, lists, cardId, card, updateCards } = this.props;
            let { cards } = this.props;
            const listWrapper = listWrapperDropped.children[1]
            const cardsWrapper = listWrapper.children[1];
            const positionListDropped = parseFloat(listWrapperDropped.children[1].dataset.position);
            // Лист на который перетаскиваем элемент       
            const listDrop = lists.find(list => (list.position === positionListDropped));
            // Элементы листа, на который перетаскиваем
            let cardsDrop = listDrop.cards;
            // индекс перетаскиваемого элемента в массиве
            const indexStart = cards.findIndex(cards => (cards.id === cardId));
            // Индекс, для вставки в новое место
            const indexForInsert = cardsDrop ? cardsDrop.length : 0;
            cardsWrapper.removeChild(this.$layer.current);
            card.position = cardsDrop ? cardsDrop.length : 0;
            
            const existsElementDropped = cardsDrop ? cardsDrop.find(value => (value.id === cardId)) : null;

            if (existsElementDropped && (cards === cardsDrop)) {
                 // Вставляем элемент в новый список
                 cards.splice(indexForInsert, 0, card);                 
                 cards.splice(indexStart, 1);
                 
                 updateCardNames(cards);
            }

            if (existsElementDropped && (cards !== cardsDrop)) {
                if (this.$cardName.current) {
                    this.$cardName.current.style.left = `${oldPosition.x}px`;
                    this.$cardName.current.style.top = `${oldPosition.y}px`;
                    this.setState({
                        isdropMouseElement: false
                    });
                }                
            } 
            
            if (!existsElementDropped) {
                // Вставляем элемент в новый список
                if (!cardsDrop) {
                    cardsDrop = [];
                    cardsDrop.push(card);
                    console.log(listDrop);
                    updateCards(cardsDrop, listDrop);
                } else {
                    cardsDrop.splice(indexForInsert, 0, card);
                    updateCards(cardsDrop, listDrop);
                }
                // Удаляем элемент из старого списка
                cards.splice(indexStart, 1);
                updateCardNames(cards);
            }
        }

        // Если мышь отпускается над листом и курсор мыши был наведен на карту
        if (isWasCardDropped && listDropped) {
            const { updateCardNames, list, lists, cardId, card, updateCards } = this.props;
            let { cards } = this.props;

            if (this.$cardName.current) {
                this.$cardName.current.style.left = `${oldPosition.x}px`;
                this.$cardName.current.style.top = `${newPosition.y}px`;
            }

            const positionListDropped = parseFloat(listDropped.dataset.position);

            // Если изменился лист при перетаскивании
            if (list.position !== positionListDropped) {
                const parentElement = this.$layer.current.parentNode;
                // Лист на который перетаскиваем элемент       
                const listDrop = lists.find(list => (list.position === positionListDropped));
                // Элементы листа, на который перетаскиваем
                const cardsDrop = listDrop.cards;
                // индекс перетаскиваемого элемента в массиве
                const indexStart = cards.findIndex(cards => (cards.id === cardId));
                // Индекс, для вставки в новое место
                const position = parseFloat(cardDropped.dataset.position);
                const indexForInsert = cardsDrop.findIndex(value => (value.position === position));

                this.setState({
                    isdropMouseElement: true,
                    newPosition: {
                        x: this.$layer.current.getBoundingClientRect().left,
                        y: this.$layer.current.getBoundingClientRect().top
                    }
                });

                const search = cardsDrop.find(value => (value.id === card.id))

                if (search) {
                    return;
                }

                parentElement.removeChild(this.$layer.current);
                // Изменяем атрибут position для исключения совпадения в новом листе
                card.position = cardsDrop.length;
                // Вставляем элемент в новый список
                cardsDrop.splice(indexForInsert, 0, card);
                updateCards(cardsDrop, listDrop);

                // Удаляем элемент из старого списка
                cards.splice(indexStart, 1);
                updateCardNames(cards);
            } else {
                const indexStart = cards.findIndex(cards => (cards.id === cardId));
                const position = parseFloat(cardDropped.dataset.position);
                const indexEnd = cards.findIndex(list => (list.position === position));

                this.setState({
                    isdropMouseElement: true,
                    newPosition: {
                        x: this.$layer.current.getBoundingClientRect().left,
                        y: this.$layer.current.getBoundingClientRect().top
                    }
                });

                // Вставляем блок тени в новое место
                this.$cardName.current.parentNode.insertBefore(this.$layer.current, this.$cardName.current);
                cards.splice(indexStart, 1);
                cards.splice(indexEnd, 0, card);
                updateCardNames(cards);
            }
        } else {
            if (this.$cardName.current) {
                this.$cardName.current.style.left = `${oldPosition.x}px`;
                this.$cardName.current.style.top = `${oldPosition.y}px`;
                this.setState({
                    isdropMouseElement: false
                });
            }
        }

        if (this.$cardName.current) {
            this.$cardName.current.style.position = '';
            this.$cardName.current.style.width = '';
            this.$cardName.current.style.top = '';
            this.$cardName.current.style.transform = '';
            this.$cardName.current.style.pointerEvents = 'auto';
            this.$cardName.current.style.zIndex = 1;
        }

        this.setState({
            isVisibleLayer: false,
            isDrag: false
        });
    }

    get classNames() {
        const { isVisibleLayer } = this.state;
        const classNames = {
            layer: ['card-name__layer']
        }

        if (isVisibleLayer) {
            classNames.layer.push('card-name__layer_visible')
        }

        return {
            layer: classNames.layer.join(' ')
        }
    }

    render() {
        const { text, card } = this.props;
        const { layer } = this.state;

        return (
            <div className='card-wrapper'>
                <div className={this.classNames.layer}
                    style={{
                        height: `${layer.height}px`,
                        width: `${layer.width}px`
                    }}
                    ref={this.$layer}
                />
                <div
                    card='card'
                    className='card-name'
                    onMouseDown={this.onMouseDown}
                    onMouseUp={this.onMouseUp}
                    ref={this.$cardName}
                    data-position={card.position}
                >
                    {text}
                </div>
            </div>
        )
    }
}