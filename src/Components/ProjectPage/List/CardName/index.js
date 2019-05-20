import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

export default class Card extends Component {
    static propTypes = {
        card: PropTypes.object,
        cardId: PropTypes.string,
        updateCardNames: PropTypes.func,
        updateCards: PropTypes.func,
        cards: PropTypes.array,
        list: PropTypes.object,
        lists: PropTypes.array,
        isDropCard: PropTypes.func,
        onChangeCard: PropTypes.func,
        text: PropTypes.string
    };

    static defaultProps = {
        card: {},
        cardId: '',
        updateCardNames: () => { },
        updateCards: () => { },
        cards: [],
        list: {},
        lists: [],
        isDropCard: () => { },
        onChangeCard: () => { },
        text: ''
    };

    constructor(props) {
        super();
        this.state = {
            isVisibleLayer: false,
            isdropMouseElement: false,
            positionDraggedList: props.list.position,
            isDrag: false,
            dragObject: {},
            oldPosition: {},
            newPosition: {},
            layer: {
                height: 18,
                width: 252
            }
        }
        this.$layer = React.createRef();
        this.$cardName = React.createRef();
        this.mouseMove = null;
        this.mouseUp = null;
    }


    shouldComponentUpdate(nextProps, nextState) {
        return (JSON.parse(JSON.stringify(nextProps.cards)) !== JSON.parse(JSON.stringify(this.props.cards)))
    }

    onMouseDown = (event) => {
        let dragObject, layer;

        if (!dragObject) {
            dragObject = this.$cardName.current.cloneNode(true);
            document.querySelector('.project-board__body').appendChild(dragObject);
        }

        //const mouseDownElement = document.elementFromPoint(event.clientX, event.clientY);
        //  parentElement.style.pointerEvents = 'none';
        //  console.log(parentElement);
        let shiftX = event.pageX - this.$cardName.current.getBoundingClientRect().left + 8;
        let shilfY = event.pageY - this.$cardName.current.getBoundingClientRect().top + 59;
        console.log('+');
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

        this.mouseMove = this.handleMouseMoveListValue.bind(this, dragObject);
        this.mouseUp = this.onMouseUp.bind(this, dragObject);

        document.addEventListener('mousemove', this.mouseMove);
        document.addEventListener('mouseup', this.mouseUp);
    }

    componentWillUnmount() {
        //console.log('componentWillUnmount', this.props.card);
        document.removeEventListener('mousemove', this.handleMouseMoveListValue);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    handleMouseMoveListValue = (dragObject, event) => {
        const { isDropCard, onMouseMove } = this.props;
        const { shiftX, shilfY, layer, cursor } = this.state;

        if ((Math.abs(cursor.x - event.pageX) > 0) && (Math.abs(cursor.y - event.pageY) > 0)) {
            const { cards, card, list, lists, updateCardNames, updateCards, findList } = this.props;
            const cardDataDragged = card ? card : {};

            if (this.$cardName.current) {
                dragObject.style.width = this.$cardName.current.offsetWidth + 'px';
            }

            const dropMouseElement = document.elementFromPoint(event.clientX, event.clientY);

            isDropCard(true);

            dragObject.style.userSelect = 'none';
            dragObject.style.zIndex = 9999;
            dragObject.style.left = `${event.pageX - shiftX}px`;
            dragObject.style.top = `${event.pageY - shilfY}px`;
            dragObject.style.position = 'absolute';
            dragObject.style.transform = 'rotate(3deg)';
            dragObject.style.pointerEvents = 'none';

            if (!dropMouseElement) {
                return;
            }

            // Для того чтобы детектить когда перетаскивый элемент не над самим листом, а над областью под ним
            const listWrapperDropped = dropMouseElement.closest('.list-wrapper');
            // Лист на который перетаскиваем
            const $listDropped = dropMouseElement.closest('[droppable="droppable"]');
            const isCardDropped = dropMouseElement ? dropMouseElement.matches('[card="card"]') : null;

            onMouseMove({ ...card, isDrag: true });

            const { saveListPos } = this.props;

            //    saveListPos(list.position);

            if ($listDropped) {
                const { findList } = this.props;

                const positionListDropped = parseFloat($listDropped.dataset.position);
                const listDropped = findList(positionListDropped);
                //const listDropped = lists.find(list => (list.position === positionListDropped));
                const cardsDropped = listDropped.cards;
                const cardTemp = card;
                const indexForRemove = cardsDropped.findIndex(card => (card.id === cardTemp.id));

                if (isCardDropped) {
                    const { saveListPos, getPositionLastDragged } = this.props;
                    const $cardDropped = dropMouseElement.closest('[card="card"]');

                    const lastSeen = getPositionLastDragged() !== '' ? getPositionLastDragged() : list.position;

                    if (lastSeen !== positionListDropped) {
                        // const removeList = lists.find(list => (list.position === lastSeen));
                        const removeList = findList(lastSeen);
                        const removeCards = removeList.cards;
                        const removeIndex = removeCards.findIndex(item => (item.isDrag === true));

                        removeCards.splice(removeIndex, 1);
                        updateCardNames(removeCards, removeList.id);
                    }

                    if (!$cardDropped) {
                        return;
                    }

                    const position = parseFloat($cardDropped.dataset.position);
                    const indexForInsert = cardsDropped.findIndex(value => (value.position === position));
                    const isExistsDraggedinDropped = cardsDropped.find(card => (card.id === cardTemp.id));

                    cardTemp.position = cardsDropped.length;
                    saveListPos(positionListDropped);

                    if (isExistsDraggedinDropped) {

                        cardsDropped.splice(indexForRemove, 1);
                        cardsDropped.splice(indexForInsert, 0, cardTemp);
                        updateCardNames(cardsDropped, listDropped.id);

                        return;
                    }

                    cardsDropped.splice(indexForInsert, 0, cardTemp);
                    updateCardNames(cardsDropped, listDropped.id);
                }
            }


            // Перетаскиваемый объект над областью под листом
            /*    if (listWrapperDropped && !listDropped) {
                    const cardDropped = dropMouseElement.closest('[card="card"]');
                    const positionCardDropped = parseFloat(cardDropped.dataset.position);
                    const cardDataDropped = cards.find(value => (value.position === positionCardDropped));
                    const indexForInsert = cards.length;
                    const indexForRemove = cards.findIndex(value => (value.position === cardDataDragged.position));
                    
                    cards.splice(indexForRemove, 1);
                    cards.splice(indexForInsert, 0, cardDataDragged);      
                } */

            // Перетаскиваемый объект попал над карту

            if (dragObject) {
                dragObject.style.height = `${layer.height}px`;
                dragObject.style.width = `${layer.width}px`;
            }
        }

        return false;
    };

    onMouseUp = (dragObject, event) => {
        const { isDropCard } = this.props;
        const { oldPosition, newPosition, isWasCardDropped, cardDropped, listWrapperDropped, listDropped } = this.state;

        // document.querySelector('.project-board__body').removeChild(dragObject);

        if (!this.$cardName.current) {
            return;
        }


        isDropCard(false);

        document.removeEventListener('mousemove', this.mouseMove);
        document.removeEventListener('mouseup', this.mouseUp);

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
        const { card } = this.props;
        //const { isVisibleLayer } = this.state;
        const classNames = {
            layer: ['card-name__layer'],
            card: ['card-name']
        }

        if (card.isDrag) {
            classNames.layer.push('card-name__layer_visible');
            classNames.card.push('card-name_hidden');
        }

        return {
            layer: classNames.layer.join(' '),
            card: classNames.card.join(' ')
        }
    }

    renderBody() {
        const { layer } = this.state;
        const { text, card } = this.props;

        //  console.warn(card.text, card)

        if (card.isDrag) {
            return (
                <div className={this.classNames.layer}
                    style={{
                        height: `${layer.height}px`,
                        width: `${layer.width}px`
                    }}
                    ref={this.$layer}
                />
            )
        }

        return (
            <div
                card='card'
                className={this.classNames.card}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                ref={this.$cardName}
                data-position={card.position}
            >
                {text}
            </div>
        )
    }

    render() {
        return (
            <div className='card-wrapper'>
                {this.renderBody()}
            </div>
        )
    }
}