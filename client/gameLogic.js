const chalk = require('chalk')
const log = x => console.log(chalk.green(x))
const Player = require('./Player')

let {Deck, equipments, monsters, shuffle, doors, treasures} = require('./cards')

function rollDie() {
  return Math.ceil(Math.random() * 6)
}

class Game {
  constructor(playerNames) {
    doors.shuffleCards()
    treasures.shuffleCards()
    this.players = shuffle(
      playerNames.map(playerName => new Player(playerName, 'Male', this))
    )
    this.playerOrder = this.players.slice()
    this.currentPlayer = {}
    this.players.forEach(player => {
      for (let i = 0; i < 4; i++) {
        player.draw(doors)
        player.draw(treasures)
      }
    })
    this.isActive = true
    this.phase = 1
    this.battle = {isActive: false}
    this.hireling = null
    this.startTurn = this.startTurn.bind(this)
    this.knockKnock = this.knockKnock.bind(this)
    this.startBattle = this.startBattle.bind(this)
    this.drawTreasure = this.drawTreasure.bind(this)
    this.lootRoom = this.lootRoom.bind(this)
    this.endTurn = this.endTurn.bind(this)
    this.startTurn()
  }

  startTurn() {
    this.currentPlayer = this.players.shift()
    this.phase = 1
    this.currentPlayer.isActive = true
    log(`ACTIVE PLAYER: ${this.currentPlayer.name}`)
  }

  knockKnock() {
    log('*knock* *knock*')
    const card = doors.draw()
    if (card.type === 'Monster') this.startBattle(card)
    else if (card.type === 'Curse') {
      card.effect(player)
      card.discard()
    } else {
      log(`You found: ${card.name}`)
      this.currentPlayer.hand.push(card)
    }
    this.phase = 2
  }

  drawTreasure() {
    this.currentPlayer.draw(treasures)
    log(this.currentPlayer.hand.map(card => card.name))
  }

  lootRoom() {
    this.currentPlayer.draw(doors)
    log(this.currentPlayer.hand.map(card => card.name))
    this.phase = 3
  }

  endTurn() {
    if (this.currentPlayer.hand.length > this.currentPlayer.maxInventory) {
      return log('You are carrying too many items!')
    } else {
      this.currentPlayer.didKillMonster = false
      this.currentPlayer.isActive = false
      this.players.push(this.currentPlayer)
      this.startTurn()
    }
  }

  startBattle(monster) {
    this.battle = new Battle(monster, this)
  }

  endGame(playerName) {
    log(`${playerName} wins!`)
  }
}

class Battle {
  constructor(monster, game) {
    this.monster = monster
    this.game = game
    this.player = this.game.currentPlayer
    this.player.inBattle = true
    this.buffs = {
      player: [],
      monster: [],
      getTotal: side => {
        return this.buffs[side]
          .map(buff => buff.bonus)
          .reduce((num1, num2) => num1 + num2, 0)
      }
    }
    this.getAttack = combatant => {
      return this[combatant].attack + this.buffs.getTotal(combatant)
    }
    this.isActive = true
    this.end = this.end.bind(this)
    this.flee = this.flee.bind(this)
    this.resolve = this.resolve.bind(this)
    log(`A '${monster.name} approaches you!`)
    log(`${monster.name}: ${monster.description}`)
    log(`Level: ${monster.level}`)
  }

  flee() {
    // this.combatants.forEach(combatant => {
    const roll = rollDie()
    if (roll + this.player.run < 5) {
      log(`${this.player.name} failed to escape!`)
      this.monster.badStuff(this.player)
    } else log(`${this.player.name} got away safely!`)
    // })
    this.end()
  }

  resolve() {
    const playerAttack =
      this.getAttack('player') + this.buffs.getTotal('player')
    const monsterAttack =
      this.getAttack('monster') + this.buffs.getTotal('monster')
    if (!!this.player.class && this.player.class === 'Warrior') playerAttack++
    if (playerAttack > monsterAttack) {
      this.monster.die()
      log(`The ${this.monster.name} has been slain!`)
      this.player.levelUp()
      this.player.didKillMonster = true
      for (let i = 0; i < this.monster.treasures; i++) {
        this.player.draw(treasures)
      }
    } else {
      log(`${this.player.name} was defeated!`)
      this.monster.badStuff(this.player)
    }
    this.end()
  }

  end() {
    this.monster.discard()
    this.buffs.player.forEach(buff => {
      buff.discard()
    })
    this.buffs.monster.forEach(buff => {
      buff.discard()
    })
    this.player.inBattle = false
    this.game.battle = {isActive: false}
    this.game.phase = 3
  }
}

module.exports = {
  Player,
  rollDie,
  shuffle,
  Battle,
  doors,
  treasures,
  log,
  Game
}