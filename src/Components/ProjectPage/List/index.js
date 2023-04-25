import React, { Component } from 'react';
import nanoid from 'nanoid';
import PropTypes from 'prop-types';

import CardName from './CardName';

import { MIN_HEIGHT_TEXTAREA_LIST, MAX_HEIGHT_TEXTAREA_LIST, STEP_HEIGHT_AUTOSIZE_TEXTAREA_LIST, TYPE_SEARCH } from '../../const';
import './index.scss';

export default class List extends Component {
    static propTypes = {
        projectId: PropTypes.string,
        list: PropTypes.object,
        addCardToList: PropTypes.func,
        findList: PropTypes.func,
        updateCardNames: PropTypes.func,
        updateLists: PropTypes.func,
        findListIndex: PropTypes.func,
        onMouseMove: PropTypes.func,
        unsetDrag: PropTypes.func,
        getLists: PropTypes.func,
        changeListName: PropTypes.func,
        localStorage: PropTypes.object
    };

    static defaultProps = {
        projectId: '',
        list: {},
        addCardToList: () => { },
        findList: () => { },
        updateCardNames: () => { },
        updateLists: () => { },
        findListIndex: () => { },
        onMouseMove: () => { },
        unsetDrag: () => { },
        getLists: () => { },
        changeListName: () => { },
        localStorage: () => { },
    };

    constructor(props) {
        super(props);
        this.localStorage = props.localStorage;
        this.state = {
            isVisibleAddCardForm: false,
            isVisibleTextareaList: false,
            isDrag: false,
            isDropCard: false,
            isVisibleLayer: false,
            lastPos: '',
            cursor: {
                x: 0,
                y: 0
            },
            shiftX: 0,
            shiftY: 0,
            layer: {
                height: 76,
                width: 260
            }
        };
        this.textareaNameList = React.createRef();
        this.hiddenTextAreaNameList = React.createRef();
        this.textareaCard = React.createRef();
        this.$card = React.createRef();
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleMouseMoveList);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    handleMouseMoveCard = (event) => {
        const { cursor, cardLayer, cardShiftX, cardShiftY, card, width } = this.state;
        const { findList, updateCardNames } = this.props;

        if (!this.dragObject) {
            return;
        }

        if ((Math.abs(cursor.x - event.pageX) > 2) && (Math.abs(cursor.y - event.pageY) > 2)) {

            this.dragObject.style.width = width + 'px';
            this.dragObject.style.height = 20 + 'px';

            const dropMouseElement = document.elementFromPoint(event.clientX, event.clientY);

            this.setState({
                isDropCard: true
            });

            this.dragObject.style.display = 'block';
            this.dragObject.style.userSelect = 'none';
            this.dragObject.style.zIndex = 9999;
            this.dragObject.style.left = `${event.pageX - cardShiftX}px`;
            this.dragObject.style.top = `${event.pageY - cardShiftY}px`;
            this.dragObject.style.position = 'absolute';
            this.dragObject.style.transform = 'rotate(3deg)';
            this.dragObject.style.pointerEvents = 'none';

            if (!dropMouseElement) {
                return;
            }

            const $listWrapperDropped = dropMouseElement.closest('.list-wrapper');
            const $listDropped = dropMouseElement.closest('[droppable="droppable"]');
            const isCardDropped = dropMouseElement ? dropMouseElement.matches('[card="card"]') : null;
       
            this.onMouseMove({ ...card, isDrag: true });

            const _card = JSON.parse(JSON.stringify(card));
            _card.isDrag = true;

            if ($listDropped) {
                const positionListDropped = parseFloat($listDropped.dataset.position);
                const listDropped = findList(positionListDropped);
                const cardsDropped = listDropped.cards;

                if (!listDropped.cards) {
                    listDropped.cards = [];
                    listDropped.cards.push(_card);
                    updateCardNames(listDropped.cards, listDropped.id);
                    this.updateDraggLayer(positionListDropped);

                    return;
                }
                
                const indexForRemove = cardsDropped.findIndex(card => (card.id === _card.id));

                if (isCardDropped) {
                    const $cardDropped = dropMouseElement.closest('[card="card"]');
                    this.updateDraggLayer(positionListDropped);

                    if (!$cardDropped) {
                        return;
                    }

                    const position = parseFloat($cardDropped.dataset.position);
                    const indexForInsert = cardsDropped.findIndex(value => (value.position === position));
                    const isExistsDraggedinDropped = cardsDropped.find(card => (card.id === _card.id));
                    const listIdDragged = this.getListId(card.id);

                    if (listIdDragged !== listDropped.id) {
                        _card.position = cardsDropped.length;
                    }

                    this.saveListPos(positionListDropped);

                    if (isExistsDraggedinDropped) {
                        cardsDropped.splice(indexForRemove, 1);
                        cardsDropped.splice(indexForInsert, 0, _card);
                        updateCardNames(cardsDropped, listDropped.id);

                        return;
                    }

                    cardsDropped.splice(indexForInsert, 0, _card);
                    updateCardNames(cardsDropped, listDropped.id);
                }
            }

            if ($listWrapperDropped && !$listDropped) {
                const $list = $listWrapperDropped.children[1];
                const position = parseFloat($list.dataset.position);
                const listDropped = findList(position);
                const cardsDropped = listDropped.cards ? listDropped.cards : [];
                const existItem = cardsDropped.find(value => (value.id === _card.id));

                _card.position = cardsDropped.length;

                this.updateDraggLayer(position);
                this.saveListPos(position);

                if (existItem) {
                    return;
                }

                cardsDropped.push(_card);
                updateCardNames(cardsDropped, listDropped.id);
            }

            if (this.dragObject) {
                this.dragObject.style.height = `${cardLayer.height}px`;
                this.dragObject.style.width = `${cardLayer.width}px`;
            }
        }

        return false;
    };

    updateDraggLayer = (positionListDropped) => {
        const { findList, updateCardNames } = this.props;

        const positionLastDragged = this.getPositionLastDragged();

        if (positionLastDragged !== positionListDropped) {
            const removeList = findList(positionLastDragged);
            const removeCards = removeList.cards;
            const removeIndex = removeCards.findIndex(item => (item.isDrag === true));

            removeCards.splice(removeIndex, 1);
            updateCardNames(removeCards, removeList.id);
        }
    };

    setDragObjectInfo = (obj, dragObject, card) => {
        const { shiftX, shiftY, cursor, layer, width } = obj;

        this.dragObject = dragObject;

        this.setState({
            dragObject,
            cardShiftX: shiftX,
            cardShiftY: shiftY,
            width,
            cursor,
            cardLayer: layer,
            card
        });
    };

    cardAdd = () => {
        const { isVisibleAddCardForm } = this.state;

        if (isVisibleAddCardForm) {
            return;
        }

        this.setState({
            isVisibleAddCardForm: true
        }, () => {
            this.textareaCard.current.value = '';
            this.textareaCard.current.focus();
        });
    };

    closeCardAdd = () => {
        this.setState({
            isVisibleAddCardForm: false
        });
    };

    addCardToList = () => {
        const { addCardToList, list } = this.props;
        let { cards } = this.props;
        const cardName = this.textareaCard.current.value;
        const position = cards ? cards.length : 0;

        if (!cards) {
            cards = []
        }

        if (!cardName) {
            return;
        }

        cards.push({
            id: nanoid(4),
            text: cardName,
            position: position,
            isDrag: false
        });

        addCardToList(cards, list.id);

        this.setState({
            ...this.state
        }, () => {
            this.textareaCard.current.value = '';
            this.textareaCard.current.focus();
        });
    };

    changeNameList = () => {
        const { isDrag } = this.state;

        if (isDrag) {
            return false;
        }

        this.setState(prevState => ({
            isVisibleTextareaList: !prevState.isVisibleTextareaList,
        }), () => {
            if (this.textareaNameList.current) {
                this.resizeArea();
                this.textareaNameList.current.focus();
                this.textareaNameList.current.select();
            }
        });
    };

    handleClickOutside = () => {
        const { list, changeListName } = this.props;
        const dataLS = this.localStorage.dataset;
        const id = this.props.projectId;
        list.name = this.textareaNameList.current.value ? this.textareaNameList.current.value : list.name;

        for (let i = 0; i < dataLS.length; i++) {
            if (dataLS[i].id === id) {
                let index = dataLS[i].lists.findIndex(value => (value.id === list.id));

                if (index !== -1) {
                    dataLS[i].lists[index].name = dataLS[i].lists[index].name ? dataLS[i].lists[index].name = list.name : '';
                }
            }
        }

        changeListName(list);


        this.localStorage.dataset = dataLS;
        this.changeNameList();
    };

    resizeArea = () => {
        if (!this.textareaNameList.current.value) {
            return;
        }

        this.hiddenTextAreaNameList.current.innerHTML = this.textareaNameList.current.value;

        let height = this.hiddenTextAreaNameList.current.offsetHeight + STEP_HEIGHT_AUTOSIZE_TEXTAREA_LIST;

        height = Math.max(MIN_HEIGHT_TEXTAREA_LIST, height);
        height = Math.min(MAX_HEIGHT_TEXTAREA_LIST, height);
        this.textareaNameList.current.style.height = height + 'px';

        if (parseFloat(this.textareaNameList.current.style.height) >= MAX_HEIGHT_TEXTAREA_LIST) {
            this.textareaNameList.current.style.overflow = 'hidden scroll';

            return;
        }

        this.textareaNameList.current.style.overflow = 'hidden';
    };

    onMouseMove = (card) => {
        const { onMouseMove, list } = this.props;

        onMouseMove(list.id, card);
    };

    getListId = () => {
        const { list } = this.props;

        return list.id || '';
    };

    saveListPos = (data) => {
        this.setState({
            lastPos: data
        })
    };

    getPositionLastDragged = () => {
        const { lastPos } = this.state;
        const { list } = this.props;

        return lastPos !== '' ? lastPos : list.position;
    };

    isDropCard = (data) => {
        this.setState({
            isDropCard: data
        });
    };

    onMouseDown = (event) => {
        this.setState({
            cursor: {
                x: event.pageX,
                y: event.pageY
            },
            layer: {
                height: this.$card.current.offsetHeight,
                width: this.$card.current.offsetWidth,
            },
            shiftX: event.pageX - this.$card.current.getBoundingClientRect().left,
            shiftY: event.pageY - this.$card.current.getBoundingClientRect().top + 59
        });

        document.addEventListener('mousemove', this.handleMouseMoveList);
        document.addEventListener('mouseup', this.onMouseUp);
    };

    handleMouseMoveList = (event) => {
        const { isDrag, shiftX, shiftY, cursor, isDropCard } = this.state;
        const { updateLists, getLists, list, findListIndex } = this.props;

        this.setState({
            isDrag: true
        });

        if (!isDrag || isDropCard) {
            return;
        }

        if ((Math.abs(cursor.x - event.pageX) > 5) && (Math.abs(cursor.y - event.pageY)) > 5) {
            this.setState({
                isVisibleLayer: true
            });
            this.$card.current.style.zIndex = 9999;
            this.$card.current.style.position = 'absolute';
            this.$card.current.style.left = `${event.pageX - shiftX}px`;
            this.$card.current.style.top = `${event.pageY - shiftY}px`;
            this.$card.current.style.transform = 'rotate(3deg)';
            this.$card.current.hidden = true;
            const dropMouseElement = document.elementFromPoint(event.clientX, event.clientY);
            const dropElementUp = dropMouseElement ? dropMouseElement.closest('[droppable="droppable"]') : null;

            if (dropElementUp) {
                const indexStart = findListIndex(TYPE_SEARCH.BY_ID, list.id);
                const position = parseFloat(dropElementUp.dataset.position);
                const indexEnd = findListIndex(TYPE_SEARCH.BY_POSITION, position);
                const lists = getLists();

                this.setState({
                    isDroppedElement: true,
                    newPosition: {
                        x: dropElementUp.getBoundingClientRect().left,
                        y: dropElementUp.getBoundingClientRect().top
                    }
                });

                lists.splice(indexStart, 1);
                lists.splice(indexEnd, 0, list);

                updateLists(lists);
            }

            this.$card.current.hidden = false;
        }

        return false;
    };

    onMouseUp = () => {
        document.removeEventListener('mousemove', this.handleMouseMoveList)
        document.removeEventListener('mouseup', this.onMouseUp);

        this.setState({
            isVisibleLayer: false
        });

        // Для того чтобы после перетаскивания не срабатывали  события клика мыши
        setTimeout(() => {
            this.setState({
                isDrag: false
            });
        }, 300);

        this.$card.current.style.left = '';
        this.$card.current.style.top = '';
        this.$card.current.style.position = '';
        this.$card.current.style.transform = '';
        this.$card.current.style.zIndex = '';
    };

    get classNames() {
        const { isVisibleAddCardForm, isVisibleTextareaList, isVisibleLayer } = this.state;
        const classNames = {
            list: ['list'],
            addCard: ['list__add-card'],
            addCardForm: ['list__form'],
            listName: ['list__header-value'],
            listTextareaHeader: ['list__header-textarea'],
            hiddenListName: ['list__header-textarea_hidden'],
            listLayer: ['list__layer']
        };

        if (isVisibleAddCardForm) {
            classNames.addCard.push('list__add-card_hidden');
            classNames.list.push('list_open');
        } else {
            classNames.list.push('list_close');
            classNames.addCardForm.push('list__form_hidden');
        }

        if (isVisibleTextareaList) {
            classNames.listName.push('list__header-value_hidden');
            classNames.hiddenListName.push('list__header-textarea_hidden_visible');
            classNames.listTextareaHeader.push('list__header-textarea_visible');
        }

        if (isVisibleLayer) {
            classNames.listLayer.push('list__layer_visible');
        }

        return {
            list: classNames.list.join(' '),
            addCard: classNames.addCard.join(' '),
            addCardForm: classNames.addCardForm.join(' '),
            listName: classNames.listName.join(' '),
            listTextareaHeader: classNames.listTextareaHeader.join(' '),
            hiddenListName: classNames.hiddenListName.join(' '),
            listLayer: classNames.listLayer.join(' ')
        }
    }

    updateCardName = (value, cardId) => {
        const { list, updateCardName } = this.props;

        const card = list.cards.find(card => (card.id === cardId));
        card.text = value;

        updateCardName(list)
    };

    renderCards() {
        const { cards, updateCardNames, findList, unsetDrag } = this.props;

        if (cards) {
            return cards.map(value => (
                <CardName
                    key={value.id}
                    card={value}
                    listName={this.props.list.name}
                    listId={this.props.list.id}
                    updateCardNames={updateCardNames}
                    findList={findList}
                    getListId={this.getListId}
                    isDropCard={this.isDropCard}
                    saveListPos={this.saveListPos}
                    getPositionLastDragged={this.getPositionLastDragged}
                    unsetDrag={unsetDrag}
                    updateCardName={this.updateCardName}
                    setDragObjectInfo={this.setDragObjectInfo}
                    handleMouseMoveCard={this.handleMouseMoveCard}
                    openCard={this.props.openCard}
                    reference={this.props.reference}
                />
            ));
        }
    };

    render() {
        const { list } = this.props;
        const { layer } = this.state;

        return (
            <div className='list-wrapper'>
                <div
                    className={this.classNames.listLayer}
                    style={{
                        height: layer.height,
                        width: layer.width
                    }}
                />
                <div
                    ref={this.$card}
                    onMouseDown={(event) => this.onMouseDown(event)}
                    onMouseUp={(event) => this.onMouseUp(event)}
                    onClick={this.openAddHeaderForm}
                    className={this.classNames.list}
                    droppable="droppable"
                    data-position={list.position}
                >
                    <div className='list__header'>
                        <div onClick={this.changeNameList} className={this.classNames.listName}>{list.name}</div>
                        <textarea
                            onBlur={this.handleClickOutside}
                            onChange={this.resizeArea}
                            className={this.classNames.listTextareaHeader}
                            ref={this.textareaNameList}
                            defaultValue={list.name}
                        />
                        <div className={this.classNames.hiddenListName}>
                            <div ref={this.hiddenTextAreaNameList} className="textarea_behavior" id="list__header-textarea_hidden" />
                        </div>
                        <div className='list__menu' />
                    </div>
                    <div className='cards-wrapper'>
                        {this.renderCards()}
                    </div>
                    <div onClick={this.cardAdd} className={this.classNames.addCard}>+ Добавить карточку</div>
                    <div className={this.classNames.addCardForm}>
                        <textarea
                            ref={this.textareaCard}
                            defaultValue=''
                            className='list__textarea'
                            placeholder='Ввести заголовок для этой карточки'
                        />
                        <button onClick={this.addCardToList} className='add-list__button add-list__button_allowToPress'>Добавить карточку</button>
                        <div onClick={this.closeCardAdd} className='list__close'>✕</div>
                    </div>
                </div>
            </div>
        )
    }
}