import React from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

class Card extends React.Component {
  constructor() {
    super()
    this.state = {
      anchorEl: null
    }
  }

  handleClick = event => {
    this.setState({anchorEl: event.currentTarget})
  }

  handleClose = () => {
    this.setState({anchorEl: null})
  }

  discard = () => {
    const {player, discard, cardIdx} = this.props
    discard(player, cardIdx)
    this.handleClose()
  }

  toggleEquip = () => {
    const {toggleEquip, player, cardIdx, card} = this.props
    toggleEquip(player, cardIdx, card)
    this.handleClose()
  }

  equipToHireling = () => {
    const {equipToHireling, player, card} = this.props
    equipToHireling(player, card)
    this.handleClose()
  }

  cast = target => {
    return () => {
      const {cast, player, cardIdx} = this.props
      cast(player, cardIdx, target)
    }
  }

  lookForTrouble = () => {
    const {lookForTrouble, card} = this.props
    lookForTrouble(card)
  }

  render() {
    const {anchorEl} = this.state
    const {card, equipped, player, game} = this.props
    const imageUrl = '/cardImages/' + this.props.card.imageUrl
    // if (card.type === 'Boost') {
    //   debugger
    //   console.log(card.requirement)
    // }
    return (
      <div className="card">
        <div className="card-view">
          <img
            className="card-img-top"
            src={imageUrl}
            alt="Card"
            aria-owns={anchorEl ? 'simple-menu' : null}
            aria-haspopup="true"
            onClick={this.handleClick}
          />
          {!equipped &&
            game.phase === 3 && (
              <button
                type="button"
                className="btn-danger discard-button"
                onClick={this.discard}
              >
                Discard
              </button>
            )}
          {(card.name !== 'Hireling' || !equipped) &&
            (card.type === 'Equipment' ||
              card.type === 'Race' ||
              card.type === 'Class') && (
              <button
                type="button"
                className="btn-primary use-button"
                onClick={this.toggleEquip}
              >
                {equipped ? 'Unequip' : 'Equip'}
              </button>
            )}
          {card.type === 'Equipment' &&
            player.hireling &&
            !player.hireling.equipment &&
            !equipped && (
              <button
                style={{top: '10em', left: '0em', width: '6em'}}
                type="button"
                className="btn-primary use-button"
                onClick={this.equipToHireling}
              >
                Equip to Hireling
              </button>
            )}
          {card.type === 'Boost' &&
            (card.requirement ? card.requirement(player) : true) && (
              <button
                type="button"
                className="btn-success use-button"
                onClick={this.cast(player)}
              >
                Use
              </button>
            )}
          {card.type === 'Monster' &&
            player.isActive &&
            game.phase === 2 &&
            !game.battle.isActive && (
              <button
                type="button"
                className="btn-danger use-button"
                onClick={this.lookForTrouble}
              >
                Fight!
              </button>
            )}
          {card.type === 'Buff' &&
            game.battle.isActive && (
              <div>
                <button
                  type="button"
                  className="btn-success use-button"
                  style={{top: '3em', left: '2em', width: '6em'}}
                  onClick={this.cast(game.battle.buffs.players)}
                >
                  Buff Player
                </button>
                <button
                  type="button"
                  className="btn-danger use-button"
                  style={{top: '8.5em', left: '2em', width: '6em'}}
                  onClick={this.cast(game.battle.buffs.monster)}
                >
                  Buff Monster
                </button>
              </div>
            )}
        </div>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.toggleEquip}>Use</MenuItem>
          <MenuItem onClick={this.discard}>Discard</MenuItem>
        </Menu>
      </div>
    )
  }
}

export default Card
