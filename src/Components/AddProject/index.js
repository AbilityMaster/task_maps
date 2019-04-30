import React, { Component } from 'react';

export default class AddProject extends Component {
    constructor(props) {
        super();
        this.input = React.createRef();
        this.state = {
            isOpen: props.isOpen,
            isAllowPress: false
        }
    }
    close = () => {
        const { updateIsOpen } = this.props;

        this.setState({
            isAllowPress: false
        });

        updateIsOpen();
    }

    changeInput = () => {
        const { isAllowPress } = this.state;

        if (!isAllowPress) {
            this.setState({
                isAllowPress: true
            });
        }
    }

    createBoard = () => {
        const { isAllowPress } = this.state;
        const { sendDataForCreateProject } = this.props;

        if (!isAllowPress) {
            return;
        }  
        
        sendDataForCreateProject(this.input.current.value);
    }

    get classNames() {
        const { isOpen } = this.props;
        const { isAllowPress } = this.state;

        const classNames = {
            createWindow: ['create-window'],
            button: ['create-window__button']
        }

        if (isOpen) {
            classNames.createWindow.push('create-window_visible');
        }

        if (isAllowPress) {
            classNames.button.push('create-window__button_allowToPress');
        }

        return {
            createWindow: classNames.createWindow.join(' '),
            button: classNames.button.join(' ')
        }
    }

    render() {
        return (
            <div className={this.classNames.createWindow}>
                <div className='form-container'>
                    <div className='create-window__add-title'>
                        <input ref={this.input} onInput={this.changeInput} placeholder='Добавить заголовок доски'></input>
                        <div onClick={this.close} className='create-window__close'></div>
                    </div>
                    <div className='create-window-background'>
                        <div className='create-window-background__item'></div>
                        <div className='create-window-background__item'></div>
                        <div className='create-window-background__item'></div>
                        <div className='create-window-background__item'></div>
                        <div className='create-window-background__item'></div>
                        <div className='create-window-background__item'></div>
                        <div className='create-window-background__item'></div>
                        <div className='create-window-background__item'></div>
                        <div className='create-window-background__item'></div>
                    </div>
                </div>
                <button onClick={this.createBoard} className={this.classNames.button}>Создать доску</button>
            </div>
        )
    }
}