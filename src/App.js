import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import Voting from './contracts/Voting.json';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = Voting.networks[networkId];
          if (deployedNetwork) {
            const contractInstance = new web3Instance.eth.Contract(
              Voting.abi,
              deployedNetwork.address
            );
            setContract(contractInstance);

            const candidates = await contractInstance.methods.getCandidates().call();
            setCandidates(candidates);
          } else {
            setError('Smart contract not deployed to detected network.');
          }
        } else {
          setError('Please install MetaMask!');
        }
      } catch (err) {
        console.error('Error loading blockchain data:', err);
        setError('Error loading blockchain data. Check console for details.');
      }
    };

    loadBlockchainData();
  }, []);

  const vote = async (candidateIndex) => {
    try {
      await contract.methods.vote(candidateIndex).send({ from: account });
      const candidates = await contract.methods.getCandidates().call();
      setCandidates(candidates);
    } catch (err) {
      console.error('Error voting:', err);
      setError('Error voting. Check console for details.');
    }
  };

  return (
    <Container>
      <h1 className="text-center my-4">Voting DApp</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <p className="text-center">Account: {account}</p>
      <Row>
        {candidates.map((candidate, index) => (
          <Col key={index} sm={12} md={6} lg={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{candidate.name}</Card.Title>
                <Card.Text>Votes: {candidate.voteCount}</Card.Text>
                <Button variant="primary" onClick={() => vote(index)}>Vote</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default App;
