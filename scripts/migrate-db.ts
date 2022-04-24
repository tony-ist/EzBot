// This is DB migration utility script from EzBot version 1.2.0 to version 2.0.0

import { MongoClient } from 'mongodb'
import config from '../src/config'

const data: any = {
  emojis: {
    OW: '543719113760178186',
    LOL: '543719470431207435',
    HOTS: '543719831187226635',
    FAF: '543720199572946944',
    SC2: '543727871332450304',
    APEX: '543777889066418186',
    WOW: '543844150798450688',
    ling: '569464850544328714',
    pylon: '569469965250592768',
    probe: '569470062231289887',
    photon: '569470463005163521',
    WC3: '584460852309262352',
    dva: '594586445877084173',
    thonk: '648571930106003456',
    zealot: '651485167692808212',
    marine: '662780059962179609',
    L4D: '698483138321711174',
    smudge: '701821247020859492',
    valorant: '717769183143919647',
    TF2: '744612938043752488',
    COH: '866333967296364574',
    KEKW: '866341110913171467',
    scghost: '907650968018108467'
  },
  roles: {
    '@everyone': '194696398413758464',
    Administrator: '251035632665624577',
    SC2: '509016671311233037',
    Overwatch: '509016808678883373',
    FAF: '509016901456887839',
    HOTS: '509025471636307971',
    EzBot: '509117912284528640',
    LOL: '530028645474107402',
    Apex: '543778201843793941',
    WOW: '543844663103324192',
    'Перетаскиватель': '576131026003165204',
    WC3: '584459761710399539',
    'Nitro Booster': '588807970687549442',
    Squad: '653328269214613535',
    L4D: '698482240056852540',
    Valorant: '717766636492292237',
    TF2: '744612211913261056',
    COH2: '866334595125608498'
  }
};

(async function() {
  const mongoClient = new MongoClient(config.dbConnectionUrl)
  await mongoClient.connect()
  const db = mongoClient.db('ezbot-test-prod')
  const newDb = mongoClient.db('ezbot-test-v13-2')

  const erCursor = await db.collection('EmotesAndRoles').find()

  for await (const emoteAndRole of erCursor) {
    await newDb.collection('activities').insertOne({
      name: emoteAndRole.role,
      emoji: data.emojis[emoteAndRole.emote],
      roleId: data.roles[emoteAndRole.role],
      presenceNames: [],
    })
  }

  const rmCursor = await db.collection('ReactionMessages').find()

  const reactionMessage = await rmCursor.next()

  if (reactionMessage === null) {
    throw new Error('Expected exactly one reaction message')
  }

  await newDb.collection('reactionmessages').insertOne(reactionMessage)
})().then(() => process.exit(0)).catch(console.error)
