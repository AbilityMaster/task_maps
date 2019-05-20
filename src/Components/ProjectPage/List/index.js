import React, { Component } from 'react';
import nanoid from 'nanoid';
import { MIN_HEIGHT_TEXTAREA_LIST, MAX_HEIGHT_TEXTAREA_LIST, STEP_HEIGHT_AUTOSIZE_TEXTAREA_LIST } from '../../const';
import CardName from './CardName';
import './index.scss';

export default class List extends Component {
    constructor(props) {
        super();
        this.localStorage = props.localStorage;
        this.state = {
            listName: props.name,
            isVisibleAddCardForm: false,
            isVisibleTextareaList: false,
            cards: props.cards ? props.cards : [],
            isDrag: false,
            isDropEl: false,
            isDropCard: false,
            isVisibleLayer: false,
            historyDrags: [],
            lastPos: '',
            shiftX: 0,
            shiftY: 0,
            oldPosition: {
                layerHeight: 76,
                layerWidth: 260
            }
        }
        this.textareaNameList = React.createRef();
        this.hiddenTextAreaNameList = React.createRef();
        this.textareaCard = React.createRef();
        this.$card = React.createRef();
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        return (JSON.parse(JSON.stringify(nextProps.list)) !== JSON.parse(JSON.stringify(this.props.list)))
        return true;
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleMouseMoveList)
        document.removeEventListener('mouseup', this.onMouseUp);
    }

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
        //const { cards } = this.state;
        const { addCardToList, list } = this.props;
        let { cards } = this.props;
        const projectId = this.props.projectId;
        const listId = this.props.listId;
        const dataLS = this.localStorage.dataset;
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
    }

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
    }

    handleClickOutside = () => {
        const dataLS = this.localStorage.dataset;
        const id = this.props.projectId;
        const listId = this.props.listId;
        const listName = this.textareaNameList.current.value;

        for (let i = 0; i < dataLS.length; i++) {
            if (dataLS[i].id === id) {
                let index = dataLS[i].lists.findIndex(lists => (lists.id === listId));

                if (index !== -1) {
                    dataLS[i].lists[index].name = dataLS[i].lists[index].name ? dataLS[i].lists[index].name = listName : '';
                }
            }
        }

        this.setState({
            listName
        });

        this.localStorage.dataset = dataLS;
        this.changeNameList();
    };

    get classNames() {
        const { isVisibleAddCardForm, isVisibleTextareaList, isVisibleLayer } = this.state;
        const classNames = {
            list: ['list'],
            addCard: ['list__add-card'],
            addCardForm: ['list__form'],
            listName: ['list__header-value'],
            listTextareaHeader: ['list__header-textarea'],
            hiddenlistName: ['list__header-textarea_hidden'],
            listLayer: ['list__layer']
        }

        if (isVisibleAddCardForm) {
            classNames.addCard.push('list__add-card_hidden');
            classNames.list.push('list_open');
        } else {
            classNames.list.push('list_close');
            classNames.addCardForm.push('list__form_hidden');
        }

        if (isVisibleTextareaList) {
            classNames.listName.push('list__header-value_hidden');
            classNames.hiddenlistName.push('list__header-textarea_hidden_visible');
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
            hiddenlistName: classNames.hiddenlistName.join(' '),
            listLayer: classNames.listLayer.join(' ')
        }
    }

    resizeArea = () => {
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
      //  console.log(list);

        onMouseMove(list.id, card);
    }   

    saveListPos = (data) => {
    //    const { historyDrags } = this.state;
     //   const { lastPos } = this.state;
     //   historyDrags.push(data);

        this.setState({
     //       historyDrags,
        lastPos: data
            })
    };

    getPositionLastDragged = () => {
        const { lastPos } = this.state;

        return lastPos;
    }

    renderCards() {
        const { cards, lists, list, updateCards, updateCardNames, findList } = this.props;

        //console.log('lists', list, cards);

        if (cards) {
            return cards.map(value => (
                <CardName
                    key={`${value.id}-${value.text}-${value.position}`}
                    card={value}
                    cardId={value.id}
                    updateCardNames={updateCardNames}
                    updateCards={updateCards}
                    cards={cards}
                    list={list}
                    findList={findList}
                    lists={lists}
                    isDropCard={this.isDropCard}
                    saveListPos={this.saveListPos}
                    getPositionLastDragged={this.getPositionLastDragged}
                    onMouseMove={this.onMouseMove}
                    onChangeCard={(card) => {
                        console.log(card, list)
                        this.props.onChangeCard(list.id, card)
                    }}
                    text={value.text}
                />
            ));
        }
    };

    updateCardNames = (data) => {
        this.setState({
            cards: data
        });
    };

    isDragListValue = (data) => {
        this.setState({
            isDragListValue: data
        });
    };

    isDropCard = (data) => {
        this.setState({
            isDropCard: data
        });
    }

    onMouseDown = (event) => {
        this.setState({
            cursor: {
                x: event.pageX,
                y: event.pageY
            },
            oldPosition: {
                x: this.$card.current.getBoundingClientRect().left,
                y: this.$card.current.getBoundingClientRect().top,
                layerHeight: this.$card.current.offsetHeight,
                layerWidth: this.$card.current.offsetWidth,
            },
            shiftX: event.pageX - this.$card.current.getBoundingClientRect().left + 8,
            shiftY: event.pageY - this.$card.current.getBoundingClientRect().top + 59
        });

        document.addEventListener('mousemove', this.handleMouseMoveList);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    handleMouseMoveList = (event) => {
        const { isDrag, shiftX, shiftY, cursor, isDropCard } = this.state;
        const { updateLists, lists, list, listId } = this.props;

        this.setState({
            isDrag: true
        });

        if (!isDrag || isDropCard) {
            return;
        }


        if ((Math.abs(cursor.x - event.pageX) > 5) && (Math.abs(cursor.y - event.pageY)) > 5) {
            this.$card.current.style.zIndex = 9999;
            this.$card.current.style.position = 'absolute';
            this.setState({
                isVisibleLayer: true
            });
            this.$card.current.style.left = `${event.pageX - shiftX}px`;
            this.$card.current.style.top = `${event.pageY - shiftY}px`;
            this.$card.current.style.transform = 'rotate(3deg)';

            this.$card.current.hidden = true;
            const dropEl = document.elementFromPoint(event.clientX, event.clientY);
            const dropElementUp = dropEl ? dropEl.closest('[droppable="droppable"]') : null;

            if (dropElementUp) {
                const indexStart = lists.findIndex(list => (list.id === listId));
                const position = parseFloat(dropElementUp.dataset.position);
                const indexEnd = lists.findIndex(list => (list.position === position));

                this.setState({
                    isDropEl: true,
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
    }

    onMouseUp = (event) => {
        const { lists, updateLists } = this.props;
        const { isDropEl, newPosition, oldPosition } = this.state;
        // document.onmousemove = null;

        document.removeEventListener('mousemove', this.handleMouseMoveList)
        document.removeEventListener('mouseup', this.onMouseUp);



        const dropEl = document.elementFromPoint(event.clientX, event.clientY);
        const dropElementUp = dropEl ? dropEl.closest('[droppable="droppable"]') : null;

        if (dropElementUp && isDropEl) {
            this.$card.current.style.left = `${newPosition.x}px`;
            this.$card.current.style.top = `${newPosition.y}px`;
        } else {
            this.$card.current.style.left = `${oldPosition.x}px`;
            this.$card.current.style.top = `${oldPosition.y}px`;
            this.setState({
                isDropEl: false
            });
        }

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

        //  updateLists(lists);
    };

    onDragStart = () => {
        return false;
    }

    render() {
        const { list } = this.props;
        const { listName } = this.state;

        return (
            <div className='list-wrapper'>
                <div
                    className={this.classNames.listLayer}
                    style={{
                        height: this.state.oldPosition.layerHeight,
                        width: this.state.oldPosition.layerWidth
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
                        <div onClick={this.changeNameList} className={this.classNames.listName}>{listName}</div>
                        <textarea
                            onBlur={this.handleClickOutside}
                            onChange={this.resizeArea}
                            className={this.classNames.listTextareaHeader}
                            ref={this.textareaNameList}
                            defaultValue={listName}
                        />
                        <div className={this.classNames.hiddenlistName}>
                            <div ref={this.hiddenTextAreaNameList} className="textarea_behavior" id="list__header-textarea_hidden" />
                        </div>
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