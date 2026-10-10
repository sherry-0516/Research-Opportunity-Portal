-- =====================================================================
-- University Research Opportunity Portal
-- Optional Sample Data for Testing & Demonstration
-- =====================================================================

USE `research_portal`;

-- Insert 3 distinct, realistic academic research opportunities
INSERT INTO `research_opportunities` 
  (`title`, `description`, `research_area`, `faculty_name`, `department`, `required_skills`, `available_positions`, `application_deadline`, `status`)
VALUES
  (
    'Edge AI Optimization for Autonomous UAV Networks',
    'Investigating lightweight convolutional neural network inference acceleration and low-latency packet routing on constrained embedded edge devices deployed across collaborative aerial drone swarms.',
    'Edge Computing & Wireless Networks',
    'Dr. Aris Thorne',
    'Computer Science & Engineering',
    'Python, PyTorch, C++, Linux Embedded Systems, Socket Programming',
    3,
    '2026-11-15',
    'Open'
  ),
  (
    'Privacy-Preserving Federated Learning in Healthcare IoT',
    'Designing differential privacy mechanisms and Byzantine-fault-tolerant consensus protocols for multi-institution collaborative predictive analytics across wearable physiological sensor streams.',
    'Distributed Systems & Cyber Security',
    'Dr. Eleanor Vance',
    'Information Technology & Security',
    'Python, TensorFlow Federated, Cryptography basics, Docker',
    2,
    '2026-12-01',
    'Open'
  ),
  (
    'Quantum Key Distribution Protocol Simulation for SDN',
    'Benchmarking post-quantum cryptographic primitives and simulated QKD line-rate channel degradation inside Software-Defined Optical Transport Networks (SDN) using Mininet and Ryu controller.',
    'Optical & Quantum Communications',
    'Prof. Tariq Mansoor',
    'Electrical & Computer Engineering',
    'Python, OpenFlow, Mininet, Network Simulator (NS-3), Linux',
    1,
    '2026-10-31',
    'Closed'
  );
