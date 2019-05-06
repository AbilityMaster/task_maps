import React, { Component } from 'react';
import Back_1 from '../../img/1.jpg';
import Back_2 from '../../img/2.jfif';
import Back_3 from '../../img/3.jfif';
import Back_4 from '../../img/4.jfif';
import Back_5 from '../../img/5.jfif';
import Back_6 from '../../img/6.jfif';

export default class AddProject extends Component {
    constructor(props) {
        super();
        this.input = React.createRef();
        this.state = {
            isOpen: props.isOpen,
            isAllowPress: false,
            background: 'rgb(210, 144, 52)'
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
        const { isAllowPress, background} = this.state;
        const { sendDataForCreateProject } = this.props;

        if (!isAllowPress) {
            return;
        }  
        
        sendDataForCreateProject(this.input.current.value, background);
    }

    selectStyle = (event) => {
        this.setState({
            background: event.target.style.background
        });
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
        const { background } = this.state;

        return (
            <div className={this.classNames.createWindow}>
                <div className='form-container'>
                    <div style={{ background: background }} className='create-window__add-title'>
                        <input ref={this.input} onInput={this.changeInput} placeholder='Добавить заголовок доски'></input>
                        <div onClick={this.close} className='create-window__close'></div>
                    </div>
                    <div className='create-window-background'>
                        <div onClick={this.selectStyle} style={{background: `url(${Back_1})` }} className='create-window-background__item'></div>
                        <div onClick={this.selectStyle} style={{background: `url(${Back_2})` }} className='create-window-background__item'></div>
                        <div onClick={this.selectStyle} style={{background: `url(${Back_3})` }} className='create-window-background__item'></div>
                        <div onClick={this.selectStyle} style={{background: `url(${Back_4})` }} className='create-window-background__item'></div>
                        <div onClick={this.selectStyle} style={{background: `url(${Back_5})` }} className='create-window-background__item'></div>
                        <div onClick={this.selectStyle} style={{background: `url(${Back_6})` }} className='create-window-background__item'></div>
                        <div onClick={this.selectStyle} style={{background: 'rgb(210, 144, 52)'}}  className='create-window-background__item'></div>
                        <div onClick={this.selectStyle} style={{background: 'rgb(0, 121, 191)'}} className='create-window-background__item'></div>
                        <div onClick={this.selectStyle} style={{background: 'rgb(81, 152, 57)'}}  className='create-window-background__item'></div>
                    </div>
                </div>
                <button onClick={this.createBoard} className={this.classNames.button}>Создать доску</button>
            </div>
        )
    }
}