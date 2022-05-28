import React, { useState } from "react";
import { View, Text, SafeAreaView, StatusBar, Image, TouchableOpacity, Modal, Animated, ScrollView } from 'react-native'
import { COLORS, SIZES } from "../constants";
import * as data from '../data/QuizData.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
const PPPScreen = ({ navigation }) => {
    const problem_length = 5;

    const [allTeams, setAllTeams] = useState(data.teams);
    var team_id = []
    var game_id = []
    var player_id = []
    const [allGames, setAllGames] = useState(data.games);

    const allPlayers = data.players;
    const [players, setPlayers] = useState(allPlayers[0]['台灣大學']);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentOptionSelected, setCurrentOptionSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [showNextButton, setShowNextButton] = useState(false);
    const [showScoreModal, setShowScoreModal] = useState(false);

    // Team, Game, Player
    const [targetTeam, setTargetTeam] = useState(null);
    const [targetGame, setTargetGame] = useState(null);
    const [targetPlayer, setTargetPlayer] = useState(null);
    const [targetGameId, setTargetGameId] = useState(null);
    const [targetPlayerId, setTargetPlayerId] = useState(null);
    const [targetPlayType, setTargetPlayType] = useState(null);
    const [targetFinish, setTargetFinish] = useState(null);
    const [targetResult, setTargetResult] = useState(null);
    const [targetFreeThrow, setTargetFreeThrow] = useState(null);
    const [isPickBH, setPickBH] = useState(null);
    const [foulPossible, setFoulPossible] = useState(null);
    const possibleFoulList = ['2y', '2x', '3y', '3x', 'Shooting Foul']
    var question = [allTeams, allGames, players, data.ppp_1, data.ppp_2[0][targetPlayType], data.ppp_3[0][isPickBH], data.ppp_4]
    var target = [targetTeam, targetGame, targetPlayer, targetPlayType, targetFinish, targetResult, targetFreeThrow]
    const question_name = ['隊伍', '敵方隊伍', '球員', 'Play Type', 'Finish', 'Result', 'Free Throw']
    // 只要有選項被點下去，就會執行這個
    // 選項點下去的部分寫在 renderQuestion()
    // 所以 validateAnswer 和 renderQuestion() 是綁在一起的
    const [start, setStart] = useState(true);
    const getTeamsList = (() => {
        if (start === true) {
            setStart(false)
            axios.get('http://localhost:7777/getTeams')
                .then((response) => {
                    const teamList = response.data['data'];
                    team_id = response.data['id'];
                    console.log(teamList);
                    setAllTeams(teamList);
                    console.log(allTeams);
                    // some mysterious issues here...
                })
                .catch((error) => { console.error(error) })

        }
    });

    const getGamesList = ((team) => {
        axios
            .post
            ('http://localhost:7777/getGamesByTeam', {
                teamName: team,
            })
            .then((response) => {
                const gameList = response.data['games'];
                game_id = response.data['id'];
                console.log(gameList);
                setAllGames(gameList);

                // some mysterious issues here...
            })
            .catch((error) => { console.error(error) })
    });
    const getPlayersList = ((team) => {
        axios
            .post
            ('http://localhost:7777/getPlayersByTeam', {
                teamName: team,
            })
            .then((response) => {
                const playerList = response.data['players'];
                player_id = response.data['id'];
                console.log(playerList);
                setPlayers(playerList);

                // some mysterious issues here...
            })
            .catch((error) => { console.error(error) })
    });
    const createPlay = ((target) => {
        axios
            .post
            ('http://localhost:7777/createPlay', {

                player_id: targetPlayerId + 1,
                game_id: targetGameId + 1,
                type: target[3],
                finish: target[4],
                result: target[5],
                free_throw: target[6],
            })
            .then((res) => {
                console.log(res.data['message']);

                // some mysterious issues here...
            })
            .catch((error) => { console.error(error) })
    });
    // 我要把這裡改成「顯示」&「把 Team 紀錄到資料庫」
    const validateSelected = (selectedOption, index) => {

        console.log(selectedOption);
        if (currentQuestionIndex == 0) {
            setTargetTeam(selectedOption);
            getPlayersList(selectedOption);
            getGamesList(selectedOption);

        }
        if (currentQuestionIndex == 1) {
            setTargetGame(selectedOption);
            setTargetGameId(index);
        }
        if (currentQuestionIndex == 2) {
            setTargetPlayer(selectedOption);
            setTargetPlayerId(index);
        }

        if (currentQuestionIndex == 3) {
            setTargetPlayType(selectedOption);
            decideResult(selectedOption);
        }
        if (currentQuestionIndex == 4) { setTargetFinish(selectedOption); }
        if (currentQuestionIndex == 5) {
            setTargetResult(selectedOption);
            decideFoulPossible(selectedOption);
        }
        if (currentQuestionIndex == 6) { setTargetFreeThrow(selectedOption); }
        // setTargetTeam(selectedOption); // 儲存選到的球隊
        setCurrentOptionSelected(selectedOption);
        // Show Next Button
        setShowNextButton(true);

    }
    const decideResult = (selectedOption) => {
        if (selectedOption == 'P&R BH') {
            setPickBH('P&R BH');
        } else {
            setPickBH('Other');
        }
    }
    const decideFoulPossible = (selectedOption) => {
        if (possibleFoulList.indexOf(selectedOption) == -1) {
            setFoulPossible(0);
        } else {
            setFoulPossible(1);
        }
    }




    // 重新開始下一次測驗
    const addGame = () => {
        createPlay(target);
        setShowScoreModal(false);                          // 把 ScoreModal 那個彈出來的東西關掉
        setCurrentQuestionIndex(0);                        // 重置題號
        setFoulPossible(1);
        setCurrentOptionSelected(null);                    // 把點選的選項都清掉
        setShowNextButton(false);                          // 把 Next Button 關起來
    }
    const addPlay = () => {
        createPlay(target);
        setShowScoreModal(false);                          // 把 ScoreModal 那個彈出來的東西關掉
        setCurrentQuestionIndex(2);                        // 重置題號
        setFoulPossible(1);
        setCurrentOptionSelected(null);                    // 把點選的選項都清掉
        setShowNextButton(false);                          // 把 Next Button 關起來
    }

    // 第一步，選球隊 (Team)
    const renderSelectTeam = () => {
        if (currentQuestionIndex < 7) {                // 第 currentQuestionIndex = 0 題是選球隊
            return (
                <ScrollView>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        alignSelf: 'center'
                    }}>
                        <Text style={{ color: COLORS.white, fontSize: 20, opacity: 0.6 }}>{question_name[currentQuestionIndex]} </Text>

                    </View>
                    <View style={{

                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        alignSelf: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap'
                    }}>
                        <View style={{
                            width: 400,
                            flexDirection: 'row',
                            // alignItems: 'flex-end',
                            alignSelf: 'center',
                            // justifyContent: 'space-between',
                            flexWrap: 'wrap'
                        }}>
                            {
                                question[currentQuestionIndex].map((option, index) => (
                                    <View >
                                        <TouchableOpacity
                                            onPress={() => validateSelected(option, index)}
                                            key={option}
                                            style={{
                                                borderWidth: 3,
                                                borderColor: option == currentOptionSelected
                                                    ? COLORS.success
                                                    : COLORS.secondary + "40",
                                                backgroundColor: option == currentOptionSelected
                                                    ? COLORS.success + "20"
                                                    : COLORS.secondary + "20",
                                                width: 180,
                                                height: 60, borderRadius: 20,
                                                flexDirection: 'row',
                                                alignItems: 'center', justifyContent: 'space-between',
                                                paddingHorizontal: 20,
                                                marginVertical: 10,
                                                marginHorizontal: 10,
                                            }}
                                        >
                                            <Text style={{ fontSize: 20, color: COLORS.white }}>{option}</Text>

                                            {/* Show Check Or Cross Icon based on correct answer*/}

                                        </TouchableOpacity>
                                    </View >
                                ))
                            }



                        </View>

                    </View>
                </ScrollView>

            )
        }
    }

    // 只要答案公布了(執行完 validateAnswer)，就會執行這個
    // 選項點下去的部分寫在 renderNextButton()
    // 所以 handleNext 和 renderNextButton() 是綁在一起的
    const handleNext = () => {
        if (currentQuestionIndex == 6 || foulPossible == 0) {
            // 已經跑完所有的題目了
            // Show Score Modal
            setShowScoreModal(true);
        } else {
            getTeamsList(false);
            // console.log('hi');
            setCurrentQuestionIndex(currentQuestionIndex + 1); // 往後一題，題號 + 1 // 設定前三頁為基本資訊
            setCurrentOptionSelected(null);                    // 把點選的選項都清掉
            setShowNextButton(false);                          // 把 Next Button 關起來
        }

        Animated.timing(progress, {
            toValue: currentQuestionIndex + 1,
            duration: 1000,
            useNativeDriver: false
        }).start();

    }

    const renderNextButton = () => {
        if (showNextButton) {
            return (
                <TouchableOpacity
                    onPress={handleNext}
                    style={{
                        marginBottom: 100, marginTop: 20, width: '100%', backgroundColor: COLORS.accent, padding: 20, borderRadius: 5
                    }}
                >
                    <Text style={{ fontSize: 20, color: COLORS.white, textAlign: 'center' }}>Next</Text>
                </TouchableOpacity>
            )
        } else {
            return null
        }
    }

    // 紀錄進行到第幾題的動態 ProgressBar
    const [progress, setProgress] = useState(new Animated.Value(0));

    const renderProgressBar = () => {
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                alignSelf: 'center'
            }}>
                {
                    target.slice(0, currentQuestionIndex).map((option, index) => (
                        <TouchableOpacity
                            onPress={() => setCurrentQuestionIndex(index)}
                            key={option}
                            style={{
                                borderWidth: 3,
                                borderColor: COLORS.button,
                                backgroundColor: COLORS.button + "20",
                                height: 50, borderRadius: 20,
                                flexDirection: 'row',
                                alignItems: 'center', justifyContent: 'space-between',
                                paddingHorizontal: 10,
                                marginHorizontal: 5,
                                marginVertical: 10
                            }}
                        >
                            <Text style={{ fontSize: 10, color: COLORS.white }}>{option}</Text>

                            {/* Show Check Or Cross Icon based on correct answer*/}

                        </TouchableOpacity>
                    ))
                }




            </View>
        )
    }

    return (
        <SafeAreaView style={{
            flex: 1
        }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <View style={{
                flex: 1,
                paddingVertical: 40,
                paddingHorizontal: 16,
                backgroundColor: COLORS.background,
                position: 'relative'
            }}>
                {getTeamsList()}
                {/* ProgressBar */}
                {renderProgressBar()}
                {renderSelectTeam()}

                {renderNextButton()}

                {/* Score Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showScoreModal}
                >
                    <View style={{
                        flex: 1,
                        backgroundColor: COLORS.primary,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <View style={{
                            backgroundColor: COLORS.white,
                            width: '90%',
                            borderRadius: 20,
                            padding: 20,
                            alignItems: 'center'
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'flex-end',
                                alignSelf: 'center'
                            }}>
                                {
                                    target.map((option, index) => (
                                        <TouchableOpacity
                                            onPress={() => setCurrentQuestionIndex(index)}
                                            key={option}
                                            style={{
                                                borderWidth: 3,
                                                borderColor: COLORS.result + "20",
                                                backgroundColor: COLORS.result,
                                                height: 60, borderRadius: 20,
                                                flexDirection: 'row',
                                                alignItems: 'center', justifyContent: 'space-between',
                                                paddingHorizontal: 0,
                                                marginHorizontal: 0,
                                                marginVertical: 10
                                            }}
                                        >
                                            <Text style={{ fontSize: 10, color: COLORS.black }}>{option}</Text>

                                            {/* Show Check Or Cross Icon based on correct answer*/}

                                        </TouchableOpacity>
                                    ))
                                }




                            </View>

                            <TouchableOpacity
                                onPress={addGame}
                                style={{
                                    backgroundColor: COLORS.accent,
                                    marginTop: 40,
                                    padding: 20, width: '100%', borderRadius: 20
                                }}
                            >
                                <Text style={{
                                    textAlign: 'center', color: COLORS.white, fontSize: 20
                                }}>Add Another Game</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={addPlay}
                                style={{
                                    backgroundColor: COLORS.accent,
                                    marginTop: 40,
                                    padding: 20, width: '100%', borderRadius: 20
                                }}
                            >
                                <Text style={{
                                    textAlign: 'center', color: COLORS.white, fontSize: 20
                                }}>Add Another  Play</Text>
                            </TouchableOpacity>


                        </View>

                    </View>
                </Modal>

                {/* Background Image */}
                <Image
                    source={require('../assets/images/DottedBG.png')}
                    style={{
                        width: SIZES.width,
                        height: 130,
                        zIndex: -1,
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        opacity: 0.5
                    }}
                    resizeMode={'contain'}
                />

            </View>
        </SafeAreaView>
    )
}

export default PPPScreen;