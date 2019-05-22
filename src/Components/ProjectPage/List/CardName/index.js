import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

export default class Card extends Component {
    static propTypes = {
        card: PropTypes.object,
        updateCardNames: PropTypes.func,
        findList: PropTypes.func,
        getListId: PropTypes.func,
        isDropCard: PropTypes.func,
        saveListPos: PropTypes.func,
        getPositionLastDragged: PropTypes.func,
        unsetDrag: PropTypes.func,
        isDragCard: PropTypes.func,
        onMouseMove: PropTypes.func
    };

    static defaultProps = {
        card: {},
        updateCardNames: () => { },
        findList: () => { },
        getListId: () => { },
        isDropCard: () => { },
        saveListPos: () => { },
        getPositionLastDragged: () => { },
        unsetDrag: () => { },
        isDragCard: () => { },
        onMouseMove: () => { }
    };

    constructor() {
        super();
        this.state = {
            layer: {
                height: 18,
                width: 252
            },
            isVisibleQuickEditor: false
        }
        this.$layer = React.createRef();
        this.$cardName = React.createRef();
        this.$cardNameChange = React.createRef();
       // this.dragObject = null;
        this.mouseMove = null;
        this.mouseUp = null;
    }

    handleMouseDown = (event) => {
        console.log('dragObject', this.dragObject);

        if (!this.dragObject) {
            this.dragObject = this.$cardName.current.cloneNode(true);
            this.dragObject.style.display = 'none';
            document.querySelector('.project-board__body').appendChild(this.dragObject);
        }

        const shiftX = event.pageX - this.$cardName.current.getBoundingClientRect().left + 8;
        const shiftY = event.pageY - this.$cardName.current.getBoundingClientRect().top + 59;

        this.setState({
            isDrag: true,
            shiftX,
            shiftY,
            cursor: {
                x: event.pageX,
                y: event.pageY
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

        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    componentWillUnmount() {
       // document.removeEventListener('mousemove', this.handleMouseMove);
       // document.removeEventListener('mouseup', this.handleMouseUp);
        console.log('-');
    }

    handleMouseMove = (event) => {
        const { isDropCard, onMouseMove, saveListPos, findList, getListId, isDragCard } = this.props;
        const { shiftX, shiftY, layer, cursor } = this.state;

      
        if ((Math.abs(cursor.x - event.pageX) > 2) && (Math.abs(cursor.y - event.pageY) > 2)) {
            const { card, updateCardNames } = this.props;

            if (this.$cardName.current) {
                this.dragObject.style.width = this.$cardName.current.offsetWidth + 'px';
            }
        
            const dropMouseElement = document.elementFromPoint(event.clientX, event.clientY);
            
            isDragCard(true);
            isDropCard(true);

            this.dragObject.style.display = 'block';
            this.dragObject.style.userSelect = 'none';
            this.dragObject.style.zIndex = 9999;
            this.dragObject.style.left = `${event.pageX - shiftX}px`;
            this.dragObject.style.top = `${event.pageY - shiftY}px`;
            this.dragObject.style.position = 'absolute';
            this.dragObject.style.transform = 'rotate(3deg)';
            this.dragObject.style.pointerEvents = 'none';

            if (!dropMouseElement) {
                return;
            }

            const $listWrapperDropped = dropMouseElement.closest('.list-wrapper');
            const $listDropped = dropMouseElement.closest('[droppable="droppable"]');
            const isCardDropped = dropMouseElement ? dropMouseElement.matches('[card="card"]') : null;

            onMouseMove({ ...card, isDrag: true });

            if ($listDropped) {
                const positionListDropped = parseFloat($listDropped.dataset.position);
                const listDropped = findList(positionListDropped);
                const cardsDropped = listDropped.cards;
                const cardTemp = card;

                if (!listDropped.cards) {
                    listDropped.cards = [];
                    listDropped.cards.push(card);
                    updateCardNames(listDropped.cards, listDropped.id);
                    this.updateDraggLayer(positionListDropped);

                    return;
                }

                const indexForRemove = cardsDropped.findIndex(card => (card.id === cardTemp.id));

                if (isCardDropped) {
                    const $cardDropped = dropMouseElement.closest('[card="card"]');

                    this.updateDraggLayer(positionListDropped);

                    if (!$cardDropped) {
                        return;
                    }

                    const position = parseFloat($cardDropped.dataset.position);
                    const indexForInsert = cardsDropped.findIndex(value => (value.position === position));
                    const isExistsDraggedinDropped = cardsDropped.find(card => (card.id === cardTemp.id));
                    const listIdDragged = getListId(card.id);

                    if (listIdDragged !== listDropped.id) {
                        cardTemp.position = cardsDropped.length;
                    }

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

            if ($listWrapperDropped && !$listDropped) {
                const $list = $listWrapperDropped.children[1];
                const position = parseFloat($list.dataset.position);
                const listDropped = findList(position);
                const cardsDropped = listDropped.cards ? listDropped.cards : [];
                const existItem = cardsDropped.find(value => (value.id === card.id));

                card.position = cardsDropped.length;
                this.updateDraggLayer(position);
                saveListPos(position);

                if (existItem) {
                    return;
                }

                cardsDropped.push(card);
                updateCardNames(cardsDropped, listDropped.id);
            }

            if ( this.dragObject) {
                this.dragObject.style.height = `${layer.height}px`;
                this.dragObject.style.width = `${layer.width}px`;
            }
        }

        return false;
    };

    updateDraggLayer = (positionListDropped) => {
        const { getPositionLastDragged, findList, updateCardNames } = this.props;

        const positionLastDragged = getPositionLastDragged();

        if (positionLastDragged !== positionListDropped) {
            const removeList = findList(positionLastDragged);
            const removeCards = removeList.cards;
            const removeIndex = removeCards.findIndex(item => (item.isDrag === true));

            removeCards.splice(removeIndex, 1);
            updateCardNames(removeCards, removeList.id);
        }
    }

    handleMouseUp = (event) => {
        const { isDropCard, saveListPos, card, unsetDrag, getPositionLastDragged, isDragCard } = this.props;
        
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);

        if (!this.dragObject) {
            return;
        }
        isDragCard(false);
        isDropCard(false);        
        this.dragObject.style.pointerEvents = 'none';

        const dropMouseElement = document.elementFromPoint(event.clientX, event.clientY);
        const $listWrapperDropped = dropMouseElement ? dropMouseElement.closest('.list-wrapper') : null;
        const $listDropped = dropMouseElement ? dropMouseElement.closest('[droppable="droppable"]') : null;

        if ($listDropped) {
            const positionListDropped = parseFloat($listDropped.dataset.position);
            unsetDrag(positionListDropped, card.id);
        }

        if ($listWrapperDropped) {
            const $list = $listWrapperDropped.children[1];
            const positionListDropped = parseFloat($list.dataset.position);
            unsetDrag(positionListDropped, card.id);
        }

        if (!$listDropped && !$listWrapperDropped) {
            const positionListDropped = getPositionLastDragged();
            unsetDrag(positionListDropped, card.id);
        }

        saveListPos('');

        if (this.dragObject) {
            this.dragObject.style.position = '';
            this.dragObject.style.width = '';
            this.dragObject.style.top = '';
            this.dragObject.style.transform = '';
            this.dragObject.style.pointerEvents = 'auto';
            this.dragObject.style.zIndex = 1;
            this.dragObject.remove();
            this.dragObject = null;
        }
    }

    get classNames() {
        const { card } = this.props;
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
    
    openEditor = () => {
        this.setState({
            isVisibleQuickEditor: true,
            quickEditor: {
                top: this.$cardName.current.getBoundingClientRect().top,
                left: this.$cardName.current.getBoundingClientRect().left,
                width:  this.$cardName.current.clientWidth
            }
        }, () => {
            this.$cardNameChange.current.select();
            this.$cardNameChange.current.focus();
        });
    }

    saveCardName = () => {
        const { card, updateCardName } = this.props;

        const value = this.$cardNameChange.current.value ? this.$cardNameChange.current.value : card.text;

        console.log('card', card);

        updateCardName(value, card.id);
        this.setState( prevState => ({
            isVisibleQuickEditor: !prevState.isVisibleQuickEditor
        }));
    }

    handleClickOutside = (event) => {
        const elem = document.elementFromPoint(event.pageX, event.pageY);
        const editor = elem.closest('.quick-editor-card');

        if (editor) {
            return;
        }

        this.setState( prevState => ({
            isVisibleQuickEditor: !prevState.isVisibleQuickEditor
        }));
    }

    renderQuickEditorCard = () => {
        const { isVisibleQuickEditor, quickEditor } = this.state;
        const { card } = this.props;

        if (isVisibleQuickEditor) {
            return (
                <div onClick={this.handleClickOutside} className='layer-card'>
                    <div className='quick-editor-card'
                        style={{
                            top: `${quickEditor.top}px`,
                            left: `${quickEditor.left}px`,
                            width: `${quickEditor.width}px`
                        }}
                    >
                        <textarea 
                            ref={this.$cardNameChange}
                            className='quick-editor-card__textarea'
                            defaultValue={card.text}
                        />
                        <button onClick={this.saveCardName} className='add-list__button add-list__button_allowToPress'>Сохранить</button>
                    </div>
                </div>
            )
        }
    }

    renderBody() {
        const { layer } = this.state;
        const { card } = this.props;

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
            <React.Fragment>
                <div
                    card='card'
                    className={this.classNames.card}
                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                    ref={this.$cardName}
                    data-position={card.position}
                >
                    {card.text}
                </div>
                {this.renderQuickEditorCard()}
                <div onClick={this.openEditor} className='card-name__edit'></div>
            </React.Fragment>
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