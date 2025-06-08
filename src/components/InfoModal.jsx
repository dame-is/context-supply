import React from 'react';
import './InfoModal.css';

const InfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="info-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>About</h2>

        <section>
          <p>
            <strong>You can use this tool to better understand the environmental impact of using AI by comparing it to everday things that people can more easily relate to.</strong> The estimates are based on available research cited below and can be toggled between a pessimistic, neutral, or optimistic calculation.
          </p>
          <p>
            <strong>For most people, the impact of using AI is likely to be insignificant in comparison to other lifestyle factors.</strong> However, for those who use AI heavily, the impact can be much more significant. Keep in mind that data centers accounted for 1.5% of the world's electricity consumption in 2024, of which AI usage is a subset along with other internet-related activities. Reducing or opting out of eating meat (especially beef) and voting for candidates who prioritize environmental issues are by far the most impactful things the average American can do.
          </p>
          <p>
            <strong>Even with individual lifestyle changes though, we will only be able to prevent long-term ecological collapse if corporations and governments make necessary changes.</strong> Their actions and prioritization of non-renewable energy sources account for the vast majority of global emissions.
          </p>
          <p>
            <strong>Note:</strong> determining the environmental impact of personal AI usage is complex and depends on factors such as model version, configuration, query length, data center efficiency, and regional energy sources. This tool is a work in progress and feedback is appreciated to help improve the accuracy and usefulness of the tool. You can reach out to me on <a href="https://bsky.app/profile/dame.is" target="_blank" rel="noopener noreferrer">Bluesky</a> or open an issue on <a href="https://github.com/dame-is/context-supply" target="_blank" rel="noopener noreferrer">GitHub</a>.
          </p>
        </section>
        
        <section>
          <h3>Further Reading</h3>
          <p>
            <a href="https://www.sustainabilitybynumbers.com/p/carbon-footprint-chatgpt" target="_blank" rel="noopener noreferrer">Sustainability by Numbers - Carbon Footprint of ChatGPT (2025)</a>
            <br />
            <a href="https://arxiv.org/pdf/2304.03271" target="_blank" rel="noopener noreferrer">UC Riverside - Making AI Less "Thirsty" (2023)</a>
            <br />
            <a href="https://www.sustainabilitybynumbers.com/p/ai-energy-demand" target="_blank" rel="noopener noreferrer">Sustainability by Numbers - AI Energy Demand (2025)</a>
          </p>
        </section>

        <section>
          <h3>Data Sources</h3>
          <p>
            <a href="https://www.pewresearch.org/internet/2025/04/03/how-the-us-public-and-ai-experts-view-artificial-intelligence/" target="_blank" rel="noopener noreferrer">Pew Research - How the U.S. Public and AI Experts View Artificial Intelligence (2025)</a>
            <br />
            <a href="https://www.washingtonpost.com/technology/2024/09/18/energy-ai-use-electricity-water-data-centers/" target="_blank" rel="noopener noreferrer">Washington Post - Energy and Water Usage of AI (2024)</a>
            <br />
            <a href="https://www.iea.org/reports/energy-and-ai" target="_blank" rel="noopener noreferrer">International Energy Agency - Energy and AI Report (2025)</a>
            <br />
            <a href="https://www.calculator.net/electricity-calculator.html" target="_blank" rel="noopener noreferrer">Electricity Calculator</a>
            <br />
            <a href="https://www.edmunds.com/electric-car/articles/how-much-electricity-does-an-ev-use.html" target="_blank" rel="noopener noreferrer">Edmunds - How Much Electricity Does an EV Use?</a>
            <br />
            <a href="https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use" target="_blank" rel="noopener noreferrer">Epoch AI - How Much Energy Does ChatGPT Use? (2025)</a>
            <br />
            <a href="https://www.epa.gov/watersense/how-we-use-water" target="_blank" rel="noopener noreferrer">EPA WaterSense - Household Water Use</a>
            <br />
            <a href="https://www.eia.gov/energyexplained/use-of-energy/electricity-use-in-homes.php" target="_blank" rel="noopener noreferrer">EIA - Electricity Use in Homes</a>
          </p>
        </section>
      </div>
    </>
  );
};

export default InfoModal; 