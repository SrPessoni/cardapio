import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, TouchableOpacity, ScrollView, FlatList, Modal, Animated } from 'react-native';
import { useFonts } from 'expo-font';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import styles from './src/components/styles';

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const [carrinho, setCarrinho] = useState([]);
  const [total, setTotal] = useState(0);
  const [valorFinalCompra, setValorFinalCompra] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [compraRealizada, setCompraRealizada] = useState(false);
  const [setFeedbackVisible] = useState(false); // Estado para controlar o feedback visual

  const fadeAnim = useRef(new Animated.Value(0)).current; // Animação de opacidade para o feedback

  const produtos = [
    { id: '1', nome: 'Hambúrguer', preco: 25.8, imagem: require('./assets/images/hamburguer.png') },
    { id: '2', nome: 'Frango', preco: 12.4, imagem: require('./assets/images/frango.png') },
    { id: '3', nome: 'Rosquinha', preco: 8.29, imagem: require('./assets/images/rosquinha.png') },
  ];

  useEffect(() => {
    if (!fontsLoaded) {
      SplashScreen.preventAutoHideAsync();
    } else {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  function showFeedback() {
    setFeedbackVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300, // Aumenta a opacidade em 300ms
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300, // Diminui a opacidade em 300ms
          useNativeDriver: true,
        }).start(() => setFeedbackVisible(false));
      }, 1500); // Oculta após 1,5 segundos
    });
  }

  function adicionarAoCarrinho(produto) {
    const produtoExistente = carrinho.find(item => item.id === produto.id);
    if (produtoExistente) {
      const novoCarrinho = carrinho.map(item =>
        item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
      );
      setCarrinho(novoCarrinho);
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
    }
    setTotal(total + produto.preco);
    showFeedback(); // Exibe o feedback visual
  }

  function removerDoCarrinho(produtoId) {
    const produto = carrinho.find(item => item.id === produtoId);
    if (produto.quantidade > 1) {
      const novoCarrinho = carrinho.map(item =>
        item.id === produtoId ? { ...item, quantidade: item.quantidade - 1 } : item
      );
      setCarrinho(novoCarrinho);
    } else {
      setCarrinho(carrinho.filter(item => item.id !== produtoId));
    }
    setTotal(total - produto.preco);
  }

  function finalizarCompra() {
    if (carrinho.length > 0) {
      setValorFinalCompra(total);
      setCompraRealizada(true);
      setCarrinho([]);
      setTotal(0);
  
      setModalVisible(false);
  
      setTimeout(() => setCompraRealizada(false), 3000);
    }
  }

  const renderCarrinhoItem = ({ item }) => (
    <View style={styles.carrinhoItem}>
      <Image source={item.imagem} style={styles.produtoImagem} />
      <View style={styles.info}>
        <Text style={styles.produtoNome}>{item.nome}</Text>
        <Text style={styles.produtoPreco}>R${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</Text>
        <View style={styles.quantidadeContainer}>
          <TouchableOpacity onPress={() => removerDoCarrinho(item.id)}>
            <Icon name="minus" size={20} color="red" />
          </TouchableOpacity>
          <Text>{item.quantidade}</Text>
          <TouchableOpacity onPress={() => adicionarAoCarrinho(item)}>
            <Icon name="plus" size={20} color="green" />
          </TouchableOpacity>
        </View>
      </View>
    </View>

  );

    const quantidadeCarrinho = carrinho.reduce((sum, item) => sum + item.quantidade, 0);

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.textoHeader}>minhaloja.com</Text>
        <View style={styles.carrinhoIconContainer}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon name="shopping-cart" style={styles.icon} />
          </TouchableOpacity>
          {quantidadeCarrinho > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{quantidadeCarrinho}</Text>
            </View>
          )}
        </View>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.container}>
        <View style={styles.body}>
          <View style={styles.produtos}>
            {produtos.map(produto => (
              <View key={produto.id} style={styles.produto}>
                <Image
                  style={styles.produtoImagem}
                  source={produto.imagem}
                  alt={`Foto de ${produto.nome}`}
                />
                <Text style={styles.produtoNome}>{produto.nome}</Text>
                <Text style={styles.produtoPreco}>R${produto.preco.toFixed(2).replace('.', ',')}</Text>
                <TouchableOpacity
                  style={styles.produtoButton}
                  onPress={() => adicionarAoCarrinho(produto)}
                >
                  <Text style={styles.produtoButtonText}>Adicionar ao carrinho</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {compraRealizada && (
        <View style={styles.popup}>
          <Text style={styles.textoPopup}>
            Obrigado pela sua compra!{'\n'}
            Valor do pedido: R${valorFinalCompra.toFixed(2).replace('.', ',')}{'\n'}
            Volte Sempre :) 
          </Text>
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.carrinho}>
          <View style={styles.headerCarrinho}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="chevron-left" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.textoCarrinho}>Meu Carrinho</Text>
          </View>
          <FlatList
            data={carrinho}
            keyExtractor={item => item.id}
            renderItem={renderCarrinhoItem}
          />
          <TouchableOpacity style={styles.botaoFinalizar} onPress={finalizarCompra}>
            <Text style={styles.textoBotaoFinalizar}>Pagar R${total.toFixed(2).replace('.', ',')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <StatusBar style="auto" />
    </>
  );
}
