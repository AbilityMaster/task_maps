import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.scss';
import Modal from "../../../Modal";
import * as ReactDOM from "react-dom";

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
        setDragObjectInfo: PropTypes.func
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
        setDragObjectInfo: () => { }
    };

    constructor() {
        super();
        this.state = {
            layer: {
                height: 18,
                width: 252
            },
            isVisibleQuickEditor: false,
            isOpenModal: false
        };
        this.$layer = React.createRef();
        this.$cardName = React.createRef();
        this.$cardNameChange = React.createRef();
        this.dragObject = null;
        this.mouseMove = null;
        this.mouseUp = null;
    }

    handleMouseDown = (event) => {
        const { setDragObjectInfo, card } = this.props;

        if (!this.dragObject) {
            this.dragObject = this.$cardName.current.cloneNode(true);
            this.dragObject.style.display = 'none';
            document.querySelector('.project-board__body').appendChild(this.dragObject);
        }

        const shiftX = event.pageX - this.$cardName.current.getBoundingClientRect().left + 8;
        const shiftY = event.pageY - this.$cardName.current.getBoundingClientRect().top + 59;
        const dragObject =  {
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
            },
            width: this.$cardName.current.offsetWidth
        };

        this.setState(
            dragObject
        );

        setDragObjectInfo(dragObject, this.dragObject, card);

        document.addEventListener('mousemove', this.props.handleMouseMoveCard);
        document.addEventListener('mouseup', this.handleMouseUp);
    };

    handleMouseUp = (event) => {
        const { isDropCard, saveListPos, card, unsetDrag, getPositionLastDragged } = this.props;

        document.removeEventListener('mousemove', this.props.handleMouseMoveCard);
        document.removeEventListener('mouseup', this.handleMouseUp);

        if (!this.dragObject) {
            return;
        }

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
    };

    get classNames() {
        const { card } = this.props;
        const classNames = {
            layer: ['card-name__layer'],
            card: ['card-name']
        };

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
                width: this.$cardName.current.clientWidth
            }
        }, () => {
            this.$cardNameChange.current.select();
            this.$cardNameChange.current.focus();
        });
    };

    saveCardName = () => {
        const { card, updateCardName } = this.props;

        const value = this.$cardNameChange.current.value ? this.$cardNameChange.current.value : card.text;

        updateCardName(value, card.id);
        this.setState(prevState => ({
            isVisibleQuickEditor: !prevState.isVisibleQuickEditor
        }));
    };

    handleClickOutside = (event) => {
        const elem = document.elementFromPoint(event.pageX, event.pageY);
        const editor = elem.closest('.quick-editor-card');

        if (editor) {
            return;
        }

        this.setState(prevState => ({
            isVisibleQuickEditor: !prevState.isVisibleQuickEditor
        }));
    };

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
    };

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
                        onClick={() => this.setState( { isOpenModal: true })}
                    >
                        {card.text}
                    </div>
                {this.renderQuickEditorCard()}
                <div onClick={this.openEditor} className='card-name__edit'/>
            </React.Fragment>
        )
    }

    onChange = (event, { value }) => {
        const { card, updateCardName } = this.props;

        updateCardName(value, card.id);
    };

    renderModal = () => {
        const { card, listName } = this.props;

        if (this.props.reference && this.props.reference.current) {
            return ReactDOM.createPortal(
                <Modal
                    onChange={this.onChange}
                    name={card.text}
                    listName={listName}
                    isOpen={this.state.isOpenModal}
                    onClose={() => { this.setState({ isOpenModal: false })}}
                />, this.props.reference.current);
        }

        return null;
    };

    render() {

        return (
                <React.Fragment>
                    {this.renderModal()}
                    <div className='card-wrapper'>
                        {this.renderBody()}
                    </div>
                </React.Fragment>
        )
    }
}