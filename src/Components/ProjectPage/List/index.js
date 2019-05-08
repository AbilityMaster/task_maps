import React, { Component } from 'react';
import nanoid from 'nanoid';
import { MIN_HEIGHT_TEXTAREA_LIST, MAX_HEIGHT_TEXTAREA_LIST, STEP_HEIGHT_AUTOSIZE_TEXTAREA_LIST } from '../../const';
import Card from './Card';
import './index.scss';

export default class List extends Component {
    constructor(props) {
        super();
        this.localStorage = props.localStorage;
        this.state = {
            listName: props.name,
            isVisibleAddCardForm: false,
            isVisibleTextareaList: false,
            cards: this.getCards(props),
            isDragged: false,
            lists: props.lists,
            list: props.list,
            isVisibleLayer: false,
            shiftX: 0,
            shiftY: 0
        }
        this.textareaNameList = React.createRef();
        this.hiddenTextAreaNameList = React.createRef();
        this.textareaCard = React.createRef();
        this.$card = React.createRef();
    }

    getCards = (props) => {
        const projectId = props.projectId;
        const listId = props.listId;
        const dataLS = this.localStorage.dataset;

        const project = dataLS.find(project => (project.id === projectId));
        const lists = project ? project.lists.find(project => (project.id === listId)) : '';

        return lists.cards || [];
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
    }

    closeCardAdd = () => {
        this.setState({
            isVisibleAddCardForm: false
        });
    }

    addCardToList = () => {
        const { cards } = this.state;
        const projectId = this.props.projectId;
        const listId = this.props.listId;
        const dataLS = this.localStorage.dataset;
        const cardName = this.textareaCard.current.value;

        if (!cardName) {
            return;
        }

        const project = dataLS.find(project => (project.id === projectId));
        const projectIndex = dataLS.findIndex(project => (project.id === projectId));
        const list = project ? project.lists.find(list => (list.id === listId)) : '';
        const listIndex = project ? project.lists.find(list => (list.id === listId)) : 0;

        cards.push({
            id: nanoid(4),
            text: cardName
        });

        list.cards = cards;

        dataLS[projectIndex].lists[listIndex] = cards;
        this.localStorage.dataset = dataLS;

        this.setState({
            cards
        }, () => {
            this.textareaCard.current.value = '';
            this.textareaCard.current.focus();
        });
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside, false);
    }

    changeNameList = () => {
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
            console.log('+++');
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

    renderCards = () => {
        const { cards } = this.state;

        return cards.map(value => (
            <Card
                key={value.id}
                cardId={value.id}
                text={value.text}
            />
        ));
    }

    onDrop = (event, cat) => {
        const dataLS = this.localStorage.dataset;
        const { listId, projectId, dropToEl } = this.props;
        const { lists } = this.state;
        let indexForInsert = 0;

        const project = dataLS.find(project => (project.id === projectId));
        const draggedList = project ? project.lists.find(list => (list.id === event.dataTransfer.getData('listId'))) : [];

        indexForInsert = lists.findIndex(list => (list.id === listId))
        const indexForDelete = parseFloat(event.dataTransfer.getData('indexForDelete'))

        if (indexForDelete <= indexForInsert) {
            indexForInsert += 1;
        }

        lists.splice(indexForInsert, 0, draggedList);

        dropToEl(lists);
    }

    onDragStart = (event, listIsd) => {
        const { lists } = this.state;
        const { listId, list } = this.props;

        const indexForDelete = lists.findIndex(list => (list.id === listId));

        lists.splice(indexForDelete, 1);

        event.dataTransfer.setData('listId', listId);
        event.dataTransfer.setData('indexForDelete', indexForDelete);
        event.dataTransfer.effectAllowed = 'move';

        this.setState({
            lists,
            draggedList: list,
            isDragged: true,
            isVisibleLayer: true
        });
        console.log('+');
    }

    onDragEnter = (event) => {
        if (this.state.isDragged) {
            return;
        }
    }

    onDragOver = (event) => {
        event.preventDefault();
    }


    onDrag = (e) => {
        const { shiftX, shiftY } = this.state;

        if ((e.pageX - shiftX + this.$card.current.clientWidth) > window.innerWidth) {
            this.$card.current.style.left = `${(window.innerWidth - this.$card.current.clientWidth) / window.innerWidth * 100}%`;
        } else {
            this.$card.current.style.left = `${(e.pageX - shiftX) / window.innerWidth * 100}%`;
        }

        if ((e.pageY - shiftY + this.$card.current.clientHeight) > window.innerHeight) {
            this.$card.current.style.top = `${(window.innerHeight - this.$card.current.clientHeight) / window.innerHeight * 100}%`;
        } else {
            this.$card.current.style.top = `${(e.pageY - shiftY) / window.innerHeight * 100}%`;
        }

        if ((e.pageY - shiftY) <= 0) {
            this.$card.current.style.top = 0;
        }

        if ((e.pageX - shiftX) <= 0) {
            this.$card.current.style.left = 0;
        }

        this.$card.current.style.position = 'absolute';
        this.$card.current.style.bottom = 'auto';
        this.$card.current.style.right = 'auto';
        document.body.appendChild(this.$card.current);

        this.$card.current.style.zIndex = 1000;
    }

    onMouseDown = (e) => {
        this.setState({
            shiftX: e.pageX - this.$card.current.offsetLeft - 51,
            shiftY: e.pageY - this.$card.current.offsetTop - 51
        })
    }
    render() {
        const { listName } = this.state;
        const listId = this.props.listId;

        return (
            <div className='list-wrapper'>
                <div
                    className={this.classNames.listLayer}
                    style={{
                        height: this.$card.current ? this.$card.current.offsetHeight : 0,
                        width: this.$card.current ? this.$card.current.offsetWidth : 0
                    }}
                />
                <div
                    ref={this.$card}
                    onDrag={(e) => this.onDrag(e)}
                    onDragOver={(e) => this.onDragOver(e)}
                    onDragEnter={(e) => this.onDragEnter(e)}
                    onDragStart={(e) => this.onDragStart(e)}
                    onDrop={(e) => this.onDrop(e, 'complete')}
                    onMouseDown={(e) => this.onMouseDown(e)}
                    draggable
                    onClick={this.openAddHeaderForm}
                    className={this.classNames.list}
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