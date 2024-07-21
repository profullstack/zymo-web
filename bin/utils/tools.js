const keywords = `
new trends in web development
latest trends in AI/ML
latest trends in native app development
tech companies hiring
tech hiring freeze
tech hiring
tech companies hiring remote
ed tech companies hiring
tech companies that are hiring
tech companies still hiring
hiring freeze tech
tech companies hiring freeze
tech hiring freeze 2022
tech startups hiring
ed tech companies hiring remote
tech companies hiring right now
are tech companies still hiring
when will tech companies start hiring again
when will tech hiring freeze end
which tech companies are hiring
vet tech jobs hiring near me
startup tech companies hiring
what tech companies are hiring
tech companies hiring now
Artificial Intelligence:

    Machine learning
    Deep learning
    Neural networks
    AI algorithms
    Natural language processing
    Computer vision
    AI ethics
    Robotic process automation
    Predictive analytics
    AI in healthcare

Remote Work:

    Telecommuting tools
    Virtual collaboration
    Work-from-home policies
    Remote team management
    Online project management
    Digital nomad
    Remote work technology
    Home office setup
    Video conferencing
    Time management remote

Sustainability:

    Renewable energy
    Green technology
    Eco-friendly practices
    Sustainable development
    Carbon footprint reduction
    Environmental impact
    Corporate social responsibility
    Recycling initiatives
    Sustainable agriculture
    Energy efficiency

5G Technology:

    Internet of Things (IoT)
    Smart cities
    High-speed connectivity
    Edge computing
    5G infrastructure
    Mobile networks
    5G security
    Network slicing
    Wireless technology
    Autonomous vehicles

Blockchain:

    Cryptocurrency
    Smart contracts
    Decentralized finance (DeFi)
    Ledger technology
    Blockchain security
    Supply chain transparency
    NFTs (Non-Fungible Tokens)
    Ethereum blockchain
    Blockchain in banking
    Digital identity

Cybersecurity:

    Information security
    Network security
    Data protection
    Cyber threat intelligence
    Ethical hacking
    Encryption
    Cloud security
    Phishing attacks
    Malware analysis
    Compliance and security

Quantum Computing:

    Quantum algorithms
    Quantum cryptography
    Quantum entanglement
    Superposition
    Quantum hardware
    Quantum simulation
    Quantum networking
    Quantum error correction
    Quantum advantage
    Quantum sensors

Mental Health:

    Wellness programs
    Stress management
    Mental health awareness
    Therapy and counseling
    Mindfulness and meditation
    Work-life balance
    Employee assistance programs
    Mental health apps
    Psychological resilience
    Anxiety and depression management

Electric Vehicles (EVs):

    EV charging stations
    Battery technology
    Autonomous driving
    Electric car models
    Sustainable transportation
    EV range
    Electric motors
    EV incentives
    Hybrid vehicles
    Electric vehicle adoption

Personalized Medicine:

    Genomics
    Precision medicine
    Genetic testing
    Biomarkers
    Targeted therapy
    Regenerative medicine
    Personal health data
    Wearable technology
    Pharmacogenomics
    Telemedicine in personalized care

`
	.split('\n')
	.map((item) => item.trim())
	.filter((item) => Boolean(item))
	.sort();

function fisherYatesShuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}

	return array;
}

export { fisherYatesShuffle, keywords };
